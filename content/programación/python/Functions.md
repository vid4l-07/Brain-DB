# Definición y llamada

```python
def sum(x, y):
    return x + y

result = sum(3, 4)   # 7
```

> [!note]
> Las funciones se definen con `def`, seguido del nombre, los parámetros entre paréntesis y dos puntos. El cuerpo va indentado.

# Parámetros por defecto

```python
def power(base, exp=2):   # exp es 2 si no se proporciona
    return base ** exp

power(3)      # 9
power(3, 4)   # 81
```

> [!warning]
> Los parámetros por defecto se evalúan una sola vez en la definición de la función, no en cada llamada. Evita valores por defecto mutables como `[]` o `{}`:
> ```python
> def bad(x, lst=[]):   # no hagas esto
>     lst.append(x)
>     return lst
> ```

# *args y **kwargs

## *args

Recibe cualquier número de argumentos **posicionales** como una tupla:

```python
def sum_all(*args):
    return sum(args)

sum_all(1, 2, 3)       # 6
sum_all(1, 2, 3, 4, 5) # 15
```

## **kwargs

Recibe cualquier número de argumentos **con nombre** (keyword arguments) como un diccionario:

```python
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Ana", age=25)
# nombre: Ana
# edad: 25
```

## Combinados

```python
def func(a, b, *args, **kwargs):
    print(a, b, args, kwargs)

func(1, 2, 3, 4, x=5, y=6)
# 1 2 (3, 4) {'x': 5, 'y': 6}
```

> [!tip]
> El orden debe ser: posicionales, `*args`, con nombre, `**kwargs`.

# Funciones lambda

Funciones anónimas definidas con `lambda`:

```python
square = lambda x: x ** 2
square(5)   # 25

add = lambda a, b: a + b
add(3, 4)   # 7
```

> [!note]
> Las lambdas son útiles para funciones cortas de una sola línea. Se usan habitualmente con `sorted()`, `map()`, `filter()`:
> ```python
> pairs = [(1, "b"), (2, "a"), (3, "c")]
> sorted(pairs, key=lambda pair: pair[1])   # [(2, 'a'), (1, 'b'), (3, 'c')]
> ```

# Ámbito (scope)

```python
x = 10

def func():
    x = 20        # variable local (distinta de la x global)
    print(x)      # 20

func()
print(x)          # 10 (la x global no cambia)
```

## global

```python
x = 10

def func():
    global x
    x = 20        # modifica la x global

func()
print(x)          # 20
```

> [!warning]
> Evita usar `global` siempre que sea posible. Es preferible pasar valores como parámetros y devolver resultados.

# Funciones de orden superior

Funciones que reciben o devuelven otras funciones:

```python
def apply(func, value):
    return func(value)

apply(lambda x: x ** 2, 5)   # 25
```

## map, filter, reduce

```python
numbers = [1, 2, 3, 4, 5]

# map: aplica una función a cada elemento
squared = list(map(lambda x: x ** 2, numbers))   # [1, 4, 9, 16, 25]

# filter: conserva los elementos donde la función devuelve True
evens = list(filter(lambda x: x % 2 == 0, numbers))   # [2, 4]

# reduce: acumula un resultado (requiere import)
from functools import reduce
total = reduce(lambda a, b: a + b, numbers)   # 15
```

# Type hints

Especifican el tipo de retorno de una función:
```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

> [!note]
> Las type hints son opcionales y no se aplican en tiempo de ejecución. Son útiles para documentación y herramientas de análisis estático.

> Siguiente: [[Classes|Classes]]
