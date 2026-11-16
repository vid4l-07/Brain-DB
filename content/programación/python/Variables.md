# Variables

En Python, las variables se crean al asignarles un valor. No es necesario declarar el tipo.

```python
name = "Ana"        # str
age = 25            # int
height = 1.75       # float
is_student = True   # bool
```

> [!note]
> Python utiliza **tipado dinámico**: el tipo se determina en tiempo de ejecución y puede cambiar con una reasignación.

# Convenciones de nombres

- Usa `snake_case` para variables y funciones.
- Comienza con una letra o `_`, nunca con un número.
- Los nombres distinguen entre mayúsculas y minúsculas (`name` ≠ `Name`).

```python
my_variable = 10      # válido
_private = 5          # válido (convención para uso interno)
2name = "error"       # inválido
```

> [!warning]
> Evita usar palabras clave de Python como nombres de variables (`if`, `for`, `class`, `import`, etc.).

# Asignación

```python
x = 10                # asignación simple
x, y, z = 1, 2, 3    # asignación múltiple
x = y = 0             # mismo valor para varias variables
x, *rest = [1, 2, 3, 4]  # x = 1, rest = [2, 3, 4]
```

# Intercambio de variables

Python permite intercambiar valores sin una variable temporal:

```python
a = 5
b = 10
a, b = b, a   # a = 10, b = 5
```

# Ámbito (scope)

Las variables tienen un ámbito que depende de dónde se definan:

```python
global_var = "global"

def my_function():
    local_var = "local"        # solo existe dentro de la función
    print(global_var)          # puede leer variables globales

my_function()
print(global_var)              # funciona
# print(local_var)             # error: local_var no está definida
```

> [!tip]
> Usa `global` para modificar una variable global dentro de una función, pero en general se desaconseja. Es preferible pasar valores como parámetros.

# Constantes

Python no tiene constantes reales. Por convención, se usan nombres en MAYÚSCULAS:

```python
MAX_RETRIES = 3
PI = 3.14159
```

> [!warning]
> Esto es solo una convención. Python no impide la reasignación de variables en MAYÚSCULAS.

> Siguiente: [[programación/python/Data Types|Data Types]]
