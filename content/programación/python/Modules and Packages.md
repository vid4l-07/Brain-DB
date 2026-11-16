# Módulos

Un módulo es un único archivo `.py`. Puedes importar funciones, clases y variables desde él.

```python
# math_utils.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

PI = 3.14159
```

```python
# main.py
import math_utils

math_utils.add(3, 4)        # 7
math_utils.PI               # 3.14159
```

# Formas de importar

```python
import math_utils                    # importar todo el módulo
from math_utils import add           # importar una función específica
from math_utils import add, subtract # importar varias
from math_utils import *             # importar todo (evitar)
import math_utils as mu              # alias del módulo
```

> [!warning]
> Evita `from module import *`. Contamina el espacio de nombres y dificulta saber de dónde provienen los nombres.

# Variables especiales

Los módulos de Python tienen varias variables especiales (dunder) que proporcionan metadatos sobre el módulo.
## __name__

Cada módulo tiene una variable `__name__`. Es igual a `"__main__"` cuando el archivo se ejecuta directamente, y al nombre del módulo cuando se importa.

```python
# math_utils.py
def add(a, b):
    return a + b

if __name__ == "__main__":
    # Este código solo se ejecuta al ejecutar math_utils.py directamente
    print(add(3, 4))   # 7
```

> [!tip]
> Usa `if __name__ == "__main__":` para escribir código que funcione tanto como script como módulo importable.

| Escenario                                       | Valor de `__name__` |
| ----------------------------------------------- | ------------------- |
| Ejecución directa: `python math_utils.py`       | `"__main__"`        |
| Importado: `import math_utils`                  | `"math_utils"`      |

## __file__

Contiene la ruta del archivo del módulo actual:

```python
# math_utils.py
print(__file__)   # "/home/user/project/math_utils.py"
```

> [!note]
> `__file__` no está definido en el intérprete interactivo ni en los módulos cargados por el runtime de C (como `sys`).

## __all__

Controla qué se exporta con `from module import *`:

```python
# math_utils.py
__all__ = ["add", "subtract"]

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def internal_func():    # no exportada
    pass
```

```python
from math_utils import *   # solo importa add y subtract
```

> [!tip]
> Define siempre `__all__` en los módulos que puedan importarse con `from module import *`. Hace explícita la API pública.

## __version__

No es una variable integrada por convención, pero se usa ampliamente para el versionado:

```python
# math_utils.py
__version__ = "1.2.0"

# También puedes leerla desde pyproject.toml o importlib.metadata
```

# Paquetes

Un paquete es un directorio con un archivo `__init__.py`. Agrupa módulos relacionados.

```
my_project/
├── main.py
└── utils/
    ├── __init__.py
    ├── math_utils.py
    └── string_utils.py
```

# \_\_init\_\_.py

`__init__.py` controla qué se exporta cuando se importa el paquete. Puede estar vacío o definir `__all__`:

```python
# utils/__init__.py
__all__ = ["add", "subtract"]

from .math_utils import add, subtract
from .string_utils import capitalize_words   # no exportada por defecto
```

> [!note]
> Si `__init__.py` está vacío, todos los módulos del directorio siguen siendo importables. Principalmente existe para marcar el directorio como un paquete.

# Importaciones relativas

Dentro de un paquete, usa importaciones relativas con puntos:

```python
# utils/math_utils.py
def add(a, b):
    return a + b
```

```python
# utils/string_utils.py
from .math_utils import add    # importar desde un módulo hermano (mismo paquete)

def sum_and_capitalize(a, b):
    return str(add(a, b)).upper()
```

| Sintaxis                   | Significado                          |
| -------------------------- | ------------------------------------ |
| `from . import module`     | Mismo paquete                        |
| `from .. import module`    | Paquete padre                        |
| `from .module import func` | Nombre específico del mismo paquete  |

> [!warning]
> Las importaciones relativas solo funcionan dentro de paquetes. No funcionan en scripts de nivel superior.
