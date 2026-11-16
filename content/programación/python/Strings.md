# Cadenas

Las cadenas en Python son secuencias **inmutables** de caracteres.

```python
s = "Hello, world!"
s2 = 'Single quotes work too'
s3 = """Multi-line
string"""
```

# Acceder a caracteres

```python
s = "Hello"
s[0]       # 'H'
s[-1]      # 'o' (último carácter)
```

> [!warning]
> Las cadenas son inmutables. `s[0] = 'h'` genera un `TypeError`.

# Slicing

```python
s = "Hello, world!"
s[0:5]      # "Hello" (del 0 al 5, sin incluir el 5)
s[7:]       # "world!" (del 7 hasta el final)
s[:5]       # "Hello" (desde el inicio hasta el 5)
s[-6:]      # "world!" (últimos 6 caracteres)
s[::2]      # "Hlo ol!" (cada 2 caracteres)
s[::-1]     # "!dlrow ,olleH" (cadena invertida)
```

# Operaciones básicas

```python
a = "Hello"
b = "World"

a + " " + b       # "Hello World" (concatenación)
a * 3             # "HelloHelloHello" (repetición)
len(a)            # 5 (longitud)
"l" in a          # True (comprobación de pertenencia)
```

# Métodos de cadenas

## Mayúsculas y minúsculas

```python
s = "Hello, World!"
s.upper()         # "HELLO, WORLD!"
s.lower()         # "hello, world!"
s.capitalize()    # "Hello, world!" (primera letra en mayúscula, resto en minúscula)
s.title()         # "Hello, World!" (cada palabra con inicial en mayúscula)
s.swapcase()      # "hELLO, wORLD!"
```

## Búsqueda y reemplazo

```python
s = "Hello, World!"

s.find("World")       # 7 (índice de la primera aparición, -1 si no se encuentra)
s.rfind("l")          # 3 (índice de la última aparición)
s.count("l")          # 3 (número de apariciones)
s.replace("World", "Python")   # "Hello, Python!"
```

## Espacios en blanco

```python
s = "  Hello, World!  "
s.strip()         # "Hello, World!" (elimina espacios iniciales/finales)
s.lstrip()        # "Hello, World!  " (elimina espacios a la izquierda)
s.rstrip()        # "  Hello, World!" (elimina espacios a la derecha)
```

> [!tip]
> `strip()` también elimina tabulaciones `\t` y saltos de línea `\n`.

## Dividir y unir

```python
s = "Hello, World!"
s.split(", ")          # ["Hello", "World!"]

words = ["Hello", "World"]
", ".join(words)       # "Hello, World"
```

## Validación

```python
"hello".isalpha()      # True (todos los caracteres son letras)
"123".isdigit()        # True (todos los caracteres son dígitos)
"hello123".isalnum()   # True (todos los caracteres son alfanuméricos)
"  ".isspace()         # True (todos los caracteres son espacios en blanco)
```

# Formateo de cadenas

## f-strings (Python 3.6+)

```python
name = "Ana"
age = 25
f"{name} is {age} years old"       # "Ana is 25 years old"
f"{3.14159:.2f}"                    # "3.14" (2 decimales)
f"{1000000:,}"                      # "1,000,000" (separador de miles)
f"{'hello':>10}"                    # "     hello" (alineado a la derecha, ancho 10)
f"{'hello':<10}"                    # "hello     " (alineado a la izquierda)
f"{'hello':^10}"                    # "  hello   " (centrado)
```

## format()

```python
"{} is {} years old".format(name, age)
"{1} {0}".format("world", "hello")   # "hello world"
```

# Conversión

```python
str(42)             # "42"
str(3.14)           # "3.14"
"42".isdigit()      # True

# A número
int("42")           # 42
float("3.14")       # 3.14
```

> Siguiente: [[Data Structures|Data Structures]]
