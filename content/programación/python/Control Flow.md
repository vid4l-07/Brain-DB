# Condicionales

## if / elif / else

```python
x = 10

if x > 0:
    print("positive")
elif x == 0:
    print("zero")
else:
    print("negative")
```

> [!note]
> Python utiliza la **indentación** (4 espacios por defecto) para definir los bloques de código en lugar de llaves `{}`.

## Operador ternario

Una forma concisa de una expresión if que devuelve un valor.
```python
x = 10
result = "positive" if x > 0 else "non-positive"
```

# Bucles

## for

```python
for i in range(5):
    print(i)    # 0, 1, 2, 3, 4
```

### range()

| Llamada                    | Descripción                                |
| -------------------------- | ------------------------------------------ |
| `range(stop)`              | 0 hasta stop-1                             |
| `range(start, stop)`       | start hasta stop-1                         |
| `range(start, stop, step)` | start hasta stop-1, incrementando en step  |

```python
range(5)         # 0, 1, 2, 3, 4
range(2, 5)      # 2, 3, 4
range(0, 10, 2)  # 0, 2, 4, 6, 8
range(5, 0, -1)  # 5, 4, 3, 2, 1
```

> [!warning]
> `range()` no incluye el valor de parada. `range(5)` va de 0 a 4.

### Iterar sobre colecciones

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)

for index, fruit in enumerate(fruits):
    print(index, fruit)   # 0 apple, 1 banana, 2 cherry
```

### Iterar hacia atrás

```python
my_list = [1, 2, 3]

for i in range(len(my_list) - 1, -1, -1):
    print(my_list[i])   # 3, 2, 1
```

## while

```python
count = 5
while count > 0:
    print(count)
    count -= 1
```

## break, continue, else

```python
for i in range(10):
    if i == 3:
        continue   # skip 3
    if i == 7:
        break      # exit loop at 7
    print(i)       # 0, 1, 2, 4, 5, 6
```

El bucle `for` puede tener un bloque `else` que se ejecuta si el bucle se completa sin `break`:

```python
for i in range(5):
    if i == 10:
        break
else:
    print("loop completed without break")   # this runs
```

# Bucles anidados

```python
for i in range(3):
    for j in range(3):
        print(f"({i},{j})", end=" ")
    print()
# (0,0) (0,1) (0,2)
# (1,0) (1,1) (1,2)
# (2,0) (2,1) (2,2)
```

> Siguiente: [[programación/python/Functions|Functions]]
