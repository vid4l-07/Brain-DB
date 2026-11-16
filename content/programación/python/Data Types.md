# Tipos de datos básicos

| Tipo       | Descripción      | Ejemplo          |
| ---------- | ---------------- | ---------------- |
| `int`      | Entero           | `42`             |
| `float`    | Coma flotante    | `3.14`           |
| `str`      | Cadena de texto  | `"hello"`        |
| `bool`     | Booleano         | `True` / `False` |
| `NoneType` | Valor nulo       | `None`           |

```python
x = 10          # int
y = 3.14        # float
s = "hello"     # str
b = True        # bool
n = None        # NoneType
```

# Comprobación de tipos

## isinstance()

```python
isinstance(42, int)             # True
isinstance(3.14, float)         # True
isinstance(42, (int, float))    # True (comprueba múltiples tipos)
isinstance("hi", str)           # True
```

> [!tip]
> `isinstance()` es la forma recomendada de comprobar tipos porque admite la herencia.

## type()

```python
type(42)            # <class 'int'>
type(42).__name__   # "int" (devuelve el nombre del tipo como cadena)

# Comprobación de tipo personalizada
def is_type(value, type_str):
    return type(value).__name__ == type_str

is_type(5, "int")   # True
```

> [!warning]
> `type()` no tiene en cuenta la herencia. Usa `isinstance()` siempre que sea posible.

# Conversión de tipos

```python
int("42")       # str → int: 42
float("3.14")   # str → float: 3.14
str(42)         # int → str: "42"
bool(1)         # int → bool: True
bool(0)         # int → bool: False
bool("")        # str → bool: False
bool("hello")   # str → bool: True
list("abc")     # str → list: ['a', 'b', 'c']
tuple([1,2])    # list → tuple: (1, 2)
```

> [!note]
> `bool()` devuelve `False` para valores vacíos: `0`, `0.0`, `""`, `[]`, `{}`, `()`, `None`.

# Validación numérica

## Comprobar si una cadena es un número

```python
def is_integer(s):
    return s.isdigit()   # True si todos los caracteres son dígitos

def is_float(s):
    parts = s.split(".")
    return len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit()

is_integer("123")    # True
is_integer("12.3")   # False
is_float("3.14")     # True
is_float("3.1.4")    # False
```

> [!tip]
> Para números negativos, elimina el `-` inicial antes de comprobar: `s.lstrip("-").isdigit()`.

# Detalles de los enteros

```python
x = 42          # decimal
y = 0b1010      # binario (10)
z = 0o12        # octal (10)
w = 0xA         # hexadecimal (10)

large = 1_000_000   # guiones bajos como separadores de miles (legibilidad)
```

> [!note]
> Los enteros en Python tienen **precisión arbitraria**: pueden ser tan grandes como la memoria lo permita, sin desbordamiento.

# Detalles de los floats

```python
x = 3.14
y = 2.5e10       # notación científica: 2.5 × 10^10
z = 1.2e-4       # 0.00012
```

> [!warning]
> La aritmética de coma flotante puede tener problemas de precisión:
> ```python
> 0.1 + 0.2   # 0.30000000000000004 (no es exactamente 0.3)
> ```
> Usa `round()` o el módulo `decimal` para cálculos precisos.

> Siguiente: [[programación/python/Strings|Strings]]
