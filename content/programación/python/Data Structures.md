# Listas

Las listas son secuencias ordenadas de elementos **mutables**.

```python
my_list = ["hello", "how are you", "goodbye"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]   # puede contener distintos tipos
```

## Acceder a elementos

```python
my_list = ["a", "b", "c", "d"]

my_list[0]        # "a"
my_list[-1]       # "d" (último elemento)
my_list[1:3]      # ["b", "c"] (segmento)
```

## Modificar elementos

```python
my_list = ["hello", "how are you", "goodbye"]

my_list[1] = "hello"                # modificar por índice
my_list[-1] = "see you later"       # modificar el último elemento
my_list[2:] = ["see you", "bye"]    # reemplazar desde el índice 2 hasta el final
my_list[:2] = ["greetings", "good morning"]   # reemplazar desde el inicio hasta el índice 2
```

> [!warning]
> Las listas son mutables, pero reasignar una lista a una nueva variable no la copia. Ambos nombres apuntan a la misma lista en memoria:
> ```python
> a = [1, 2, 3]
> b = a
> b.append(4)
> print(a)   # [1, 2, 3, 4] (a también se modifica)
> ```
> Usa `b = a.copy()` o `b = a[:]` para crear una copia real.

## Añadir elementos

```python
my_list = ["a", "b"]

my_list.append("c")               # añadir al final: ["a", "b", "c"]
my_list.insert(1, "x")           # insertar en el índice 1: ["a", "x", "b", "c"]
my_list.extend(["d", "e"])       # añadir varios: ["a", "x", "b", "c", "d", "e"]

my_list2 = my_list + ["f", "g"]  # concatenación (crea una nueva lista)
```

## Eliminar elementos

```python
my_list = ["a", "b", "c", "d"]

my_list.pop()         # elimina y devuelve "d"
my_list.pop(1)        # elimina y devuelve "b"
my_list.remove("a")   # elimina la primera aparición de "a"
my_list.clear()       # elimina todos los elementos
```

## Búsqueda

```python
my_list = ["a", "b", "c", "b"]

my_list.index("b")      # 1 (primera aparición)
my_list.count("b")      # 2 (número de apariciones)
"b" in my_list          # True (comprobación de pertenencia)
```

## Ordenación

```python
numbers = [3, 1, 4, 1, 5, 9]

numbers.sort()              # ordena in situ (ascendente)
numbers.sort(reverse=True)  # ordena in situ (descendente)
sorted(numbers)             # devuelve una nueva lista ordenada (la original no cambia)
```

## Métodos de listas

| Método | Descripción |
|--------|-------------|
| `append(x)` | Añade `x` al final |
| `insert(i, x)` | Inserta `x` en el índice `i` |
| `extend(iterable)` | Añade todos los elementos de un iterable |
| `pop([i])` | Elimina y devuelve el elemento en `i` (el último si no se indica índice) |
| `remove(x)` | Elimina la primera aparición de `x` |
| `clear()` | Elimina todos los elementos |
| `index(x)` | Devuelve el índice de la primera `x` |
| `count(x)` | Cuenta las apariciones de `x` |
| `sort()` | Ordena in situ |
| `reverse()` | Invierte el orden in situ |
| `copy()` | Devuelve una copia superficial (shallow copy) |

## Funciones integradas

```python
numbers = [3, 1, 4, 1, 5, 9]

len(numbers)    # 6 (longitud)
sum(numbers)    # 23 (suma de los elementos)
max(numbers)    # 9 (máximo)
min(numbers)    # 1 (mínimo)
```

## List comprehension

```python
squares = [x**2 for x in range(5)]           # [0, 1, 4, 9, 16]
evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]
```

---

# Tuplas

Las tuplas son secuencias ordenadas de elementos **inmutables**.

```python
tuple1 = ("one", "two", "three")
tuple2 = ("four", "five")
my_tuple = tuple1 + tuple2    # concatenación: ("one", "two", "three", "four", "five")
```

> [!note]
> Las cadenas comparten propiedades con las tuplas: ambas son inmutables y admiten las mismas operaciones (`len`, `count`, `index`, etc.).

## Acceder a elementos

```python
my_tuple = ("a", "b", "c")
my_tuple[0]       # "a"
my_tuple[-1]      # "c"
my_tuple[1:3]     # ("b", "c")
```

## Desempaquetado

```python
my_tuple = ("one", "two", "three")
one, two, three = my_tuple   # one = "one", two = "two", three = "three"

# Ignorar valores con _
a, _, c = (1, 2, 3)      # a = 1, c = 3
```

## Conversión

```python
list(my_tuple)     # convierte la tupla en lista
tuple(my_list)     # convierte la lista en tupla
```

> [!tip]
> Las tuplas son más rápidas que las listas y usan menos memoria. Úsalas cuando los datos no deban cambiar.

---

# Diccionarios

Los diccionarios son colecciones **mutables** de pares **clave-valor**. No funcionan por índice, sino por clave.
```python
my_dict = {"key1": "value1", "key2": "value2"}
```

## Acceder a valores

```python
my_dict["key1"]              # "value1"
my_dict.get("key1")          # "value1" (igual que [])
my_dict.get("key3", "default")  # "default" (devuelve el valor por defecto si la clave no existe)
```

> [!warning]
> Acceder a una clave inexistente con `[]` genera un `KeyError`. Usa `.get()` para un acceso seguro.

## Modificar

```python
my_dict["key1"] = "new value1"       # modificar una clave existente
my_dict["key3"] = "value3"           # añadir una clave nueva
my_dict.update({"key4": "value4"})   # añadir/actualizar varias claves
```

## Eliminar

```python
del my_dict["key2"]            # eliminar por clave
my_dict.pop("key1")            # eliminar y devolver el valor
my_dict.popitem()              # eliminar y devolver el último par insertado
my_dict.clear()                # eliminar todos los elementos
```

## Claves y valores

```python
my_dict.keys()      # dict_keys(["key1", "key2"])
my_dict.values()    # dict_values(["value1", "value2"])
my_dict.items()     # dict_items([("key1", "value1"), ("key2", "value2")])
```

> [!note]
> `keys()`, `values()` e `items()` devuelven **vistas** (views), no listas. Usa `list()` para convertirlas en una lista si necesitas acceso por índice.

## Iterar

```python
my_dict = {"key1": "value1", "key2": "value2"}

for key in my_dict:
    print(key, my_dict[key])

for key, value in my_dict.items():
    print(key, value)
```

## Métodos de diccionarios

| Método | Descripción |
|--------|-------------|
| `get(key[, default])` | Obtiene el valor por clave (devuelve `default` si no se encuentra) |
| `update(other)` | Actualiza/añade pares desde otro diccionario |
| `pop(key)` | Elimina y devuelve el valor |
| `popitem()` | Elimina y devuelve el último par |
| `keys()` | Vista de todas las claves |
| `values()` | Vista de todos los valores |
| `items()` | Vista de todos los pares (clave, valor) |
| `copy()` | Copia superficial |

---
# Conjuntos (sets)

Los conjuntos son colecciones **mutables**, no ordenadas, de elementos **únicos**.
```python
my_set = {"apple", "banana", "orange"}
numbers = {1, 2, 3, 4, 5}
```

Los conjuntos no permiten elementos duplicados:
```python
numbers = {1, 2, 2, 3, 3}

print(numbers)    # {1, 2, 3}
```

>[!Note]
>Los conjuntos **no están ordenados**, por lo que no puedes acceder a los elementos por índice ni depender de su orden de iteración.

## Crear conjuntos

```python
my_set = {1, 2, 3}

empty_set = set()        # {} crea un diccionario vacío
from_list = set([1, 2, 3])
from_string = set("hello")   # {"h", "e", "l", "o"}
```

## Añadir elementos

```python
my_set = {1, 2, 3}

my_set.add(4)             # {1, 2, 3, 4}
my_set.update([5, 6, 7])  # añadir varios elementos
```

>[!Note]
>`add()` añade un único elemento, mientras que `update()` añade todos los elementos de un iterable.

## Eliminar elementos

```python
my_set = {1, 2, 3, 4}

my_set.remove(2)     # elimina 2
my_set.discard(3)    # elimina 3 si existe
my_set.pop()         # elimina y devuelve un elemento arbitrario
my_set.clear()       # elimina todos los elementos
```

>[!Warning]
>`remove()` genera un `KeyError` si el elemento no existe. `discard()` no hace nada en ese caso.

## Búsqueda

```python
my_set = {"a", "b", "c"}

"a" in my_set       # True
"x" in my_set       # False

"a" not in my_set   # False
```

Las comprobaciones de pertenencia suelen ser muy rápidas porque los conjuntos se implementan mediante una tabla hash.

## Operaciones con conjuntos

Los conjuntos son especialmente útiles para operaciones matemáticas de conjuntos.

### Unión

Devuelve todos los elementos de ambos conjuntos, eliminando duplicados.
```python
a = {1, 2, 3}
b = {3, 4, 5}

a | b
# {1, 2, 3, 4, 5}

a.union(b)
# {1, 2, 3, 4, 5}
```

### Intersección

Devuelve los elementos que existen en ambos conjuntos.
```python
a = {1, 2, 3}
b = {2, 3, 4}

a & b
# {2, 3}

a.intersection(b)
# {2, 3}
```

### Diferencia

Devuelve los elementos que están en el primer conjunto pero no en el segundo.
```python
a = {1, 2, 3}
b = {2, 3, 4}

a - b
# {1}

a.difference(b)
# {1}
```

El orden importa:
```python
b - a
# {4}
```

### Diferencia simétrica

Devuelve los elementos que pertenecen a cualquiera de los conjuntos, pero no a ambos.
```python
a = {1, 2, 3}
b = {2, 3, 4}

a ^ b
# {1, 4}

a.symmetric_difference(b)
# {1, 4}
```

## Comparar conjuntos

```python
a = {1, 2, 3}
b = {3, 1, 2}
c = {1, 2}

a == b        # True
a != c        # True
```

### Subconjuntos y superconjuntos

Un conjunto es **subconjunto** si todos sus elementos están contenidos en otro conjunto.
```python
a = {1, 2, 3}
b = {1, 2}

b.issubset(a)       # True
b <= a              # True

a.issuperset(b)     # True
a >= b              # True
```

## Conjuntos disjuntos

Dos conjuntos son disjuntos si no tienen elementos en común.
```python
a = {1, 2}
b = {3, 4}

a.isdisjoint(b)     # True
```

## Copiar

Los conjuntos son mutables, así que asignar un conjunto a otro no crea una copia.
```python
a = {1, 2, 3}
b = a

b.add(4)

print(a)    # {1, 2, 3, 4}
```

Usa `.copy()` para crear una copia superficial:
```python
b = a.copy()
```

## Iterar

```python
my_set = {"apple", "banana", "orange"}

for item in my_set:
    print(item)
```

>[!Warning]
>Como los conjuntos no están ordenados, no se debe confiar en el orden de iteración.

## Set comprehension

Los conjuntos admiten comprensiones similares a las listas, pero producen un conjunto de valores únicos.

```python
squares = {x**2 for x in range(5)}
# {0, 1, 4, 9, 16}

evens = {x for x in range(10) if x % 2 == 0}
# {0, 2, 4, 6, 8}
```

## Frozensets

`frozenset` es una versión **inmutable** de un conjunto.

```python
my_set = frozenset([1, 2, 3])
```

No se pueden añadir ni eliminar elementos:

```python
my_set.add(4)       # AttributeError
my_set.remove(1)    # AttributeError
```

Como un `frozenset` es inmutable y hashable, puede usarse como clave de un diccionario o como elemento de otro conjunto.

```python
groups = {
    frozenset({"admin", "user"}),
    frozenset({"guest"})
}
```

>[!Note]
>Los elementos de un conjunto normal deben ser **hashables**, por lo que puedes almacenar valores como números, cadenas y tuplas, pero no valores mutables como listas o diccionarios.

## Métodos de conjuntos

| Método                        | Descripción                                       |
| ----------------------------- | ------------------------------------------------- |
| `add(x)`                      | Añade `x` al conjunto                             |
| `update(iterable)`            | Añade todos los elementos de un iterable          |
| `remove(x)`                   | Elimina `x` (genera `KeyError` si no existe)      |
| `discard(x)`                  | Elimina `x` si existe                             |
| `pop()`                       | Elimina y devuelve un elemento arbitrario         |
| `clear()`                     | Elimina todos los elementos                       |
| `copy()`                      | Devuelve una copia superficial                    |
| `union(other)`                | Devuelve la unión de dos conjuntos                |
| `intersection(other)`         | Devuelve los elementos comunes                    |
| `difference(other)`           | Devuelve los elementos solo del primer conjunto   |
| `symmetric_difference(other)` | Devuelve los elementos en cualquiera, pero no ambos |
| `issubset(other)`             | Comprueba si este conjunto es un subconjunto      |
| `issuperset(other)`           | Comprueba si este conjunto es un superconjunto    |
| `isdisjoint(other)`           | Comprueba si dos conjuntos no tienen elementos en común |

## Operadores de conjuntos

| Operador | Descripción                   |
| -------- | ----------------------------- |
| `a \| b` | Unión                         |
| `a & b`  | Intersección                  |
| `a - b`  | Diferencia                    |
| `a ^ b`  | Diferencia simétrica          |
| `a <= b` | `a` es subconjunto de `b`     |
| `a >= b` | `a` es superconjunto de `b`   |

> Siguiente: [[programación/python/Control Flow|Control Flow]]
