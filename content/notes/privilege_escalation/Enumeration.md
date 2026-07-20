
# Environment variables

Always inspect `env` after obtaining a shell, could be sensitive data.
```bash
env
```

# Files
## Files with SUID perms

A file with the SUID bit set executes with the permissions of the file owner, not the user who runs it.

```bash
find / -perm -4000 -type f 2>/dev/null
```
## Files with SGID perms

A file with the SUID bit set executes with the **group** permissions of the file owner, not the user who runs it.

```bash
find / -perm -2000 -type f 2>/dev/null
```
## Writable files

```bash
find / -writable 2>/dev/null | grep -v "sys\|proc\|opt\|var\|run\|dev\|tmp"
```

# Tasks
## Cron

Scheduled tasks
```bash
crontab -l
cat /etc/crontab
```

## Systemd scheduled tasks

```bash
systemctl list-timers
```

## Incron

Tasks that executes in system events (create/write/delete files, etc.)

```bash
systemctl status incron # check if is active
cat /etc/incron.d/* # see all the active incron tasks
```

Format:
```txt
path_to_watch event command_to_execute parameter (optional)
```

Events: 
- IN_CREATE
- IN_MODIFY
- IN_DELETE
- IN_MOVED_TO
- IN_MOVED_FROM
- IN_ALL_EVENTS

Parameters: incron replaces the parameter with a file path:
- `$@` : watched file path
- `$#` : file or object that triggered the event
- `$%` : event type

# Capabilities

Capabilities split the traditional root privileges. Instead of full root access, processes can be granted only the privileges they need (binding ports, changing file ownership, etc.)

```bash
getcap -r / 2> /dev/null # recursive search
getcap file # capabilities of a specific file
```

Format:
```txt
/file capabilitie=flags
```

Common:
- `CAP_NET_ADMIN`: allows network configuration changes.
- `CAP_NET_BIND_SERVICE`: allows binding to ports below 1024.
- `CAP_DAC_OVERRIDE`: bypasses file permissions (can read/write/execute all files).
- `CAP_SETUID`: allows changing user IDs (can be critical for escalation if misused).

Capabilitie flags:
- `e` (effective): The capabilitie is being used 
- `p` (permitted): The capabilite can be used
- `i` (inheritable): The cababilitie can be inherited
- `a` (ambient): The capabilitie stays active even after the process executes another program

