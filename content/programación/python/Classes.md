# Definición

Las clases son plantillas para crear objetos. Definen atributos (datos) y métodos (comportamiento).

```python
class Movie:
    title: str
    director: str
    year: int
```

# __init__

El método `__init__` es el **constructor**. Inicializa los atributos cuando se crea un objeto.

```python
class Movie:
    def __init__(self, title: str, director: str, year: int):
        self.title = title
        self.director = director
        self.year = year
```

> [!note]
> `self` hace referencia a la **instancia actual** de la clase. Debe ser el primer parámetro de cada método.

# Crear instancias

```python
movie = Movie("The Godfather", "Francis Ford Coppola", 1972)
print(movie.title)   # "The Godfather"
```

# Métodos de instancia

Un método que se llama sobre una instancia de un tipo y puede acceder a sus datos.

```python
class Movie:
    def __init__(self, title: str, director: str, year: int):
        self.title = title
        self.director = director
        self.year = year

    def describe(self):
        return f"{self.title} ({self.year}), directed by {self.director}"
```

```python
movie = Movie("The Godfather", "Francis Ford Coppola", 1972)
movie.describe()   # "The Godfather (1972), directed by Francis Ford Coppola"
```

# Tipos de atributos

## Atributos de instancia

Son únicos para cada objeto y se definen en `__init__`:

```python
class Movie:
    def __init__(self, title):
        self.title = title   # instance attribute
```

## Atributos de clase

Son compartidos por todas las instancias de la clase y se definen fuera de los métodos:

```python
class Movie:
    genre = "drama"   # class attribute

    def __init__(self, title):
        self.title = title
```

```python
movie1 = Movie("The Godfather")
movie2 = Movie("Inception")

Movie.genre    # "drama"
movie1.genre   # "drama"
movie2.genre   # "drama"
```

> [!warning]
> Si modificas un atributo de clase a través de una instancia, se crea un **nuevo atributo de instancia** que oculta el atributo de clase. Modifica siempre los atributos de clase a través del nombre de la clase.

# Dunder

Dunder es un término de Python para los nombres rodeados por dobles guiones bajos.
## Atributos especiales

Los objetos de Python tienen atributos integrados que proporcionan metadatos sobre el objeto o la clase. No son métodos, son propiedades o clases.

### Atributos de instancia

```python
class Movie:
    def __init__(self, title, year):
        self.title = title
        self.year = year

movie = Movie("Inception", 2010)
```

| Atributo     | Descripción                           | Ejemplo                                                   |
| ------------ | ------------------------------------- | --------------------------------------------------------- |
| `__class__`  | La clase de la instancia              | `movie.__class__` → `<class 'Movie'>`                     |
| `__dict__`   | Diccionario de atributos de instancia | `movie.__dict__` → `{'title': 'Inception', 'year': 2010}` |
| `__sizeof__` | Tamaño en bytes                       | `movie.__sizeof__()` → `48`                               |

```python
movie = Movie("Inception", 2010)

movie.__class__          # <class '__main__.Movie'>
movie.__dict__           # {'title': 'Inception', 'year': 2010}
isinstance(movie, Movie) # True (usa __class__)
```

> [!tip]
> `__dict__` es útil para depurar o acceder dinámicamente a todos los atributos. Puedes iterar sobre él como con cualquier diccionario.

### Atributos de clase

`<class 'name'>`

```python
class Movie:
    genre = "drama"

    def __init__(self, title):
        self.title = title
```

| Atributo           | Descripción                            | Ejemplo                                                 |
| ------------------ | -------------------------------------- | ------------------------------------------------------- |
| `__name__`         | Nombre de la clase                     | `Movie.__name__` → `'Movie'`                            |
| `__qualname__`     | Nombre cualificado (con ámbito)        | `Movie.__qualname__` → `'Movie'`                        |
| `__module__`       | Módulo donde se define                 | `Movie.__module__` → `'__main__'`                       |
| `__bases__`        | Tupla de clases padre                  | `Movie.__bases__` → `(object,)`                         |
| `__mro__`          | Orden de resolución de métodos (MRO)   | `Movie.__mro__` → `(<class 'Movie'>, <class 'object'>)` |
| `__dict__`         | Diccionario de atributos de clase      | `Movie.__dict__` → `mappingproxy({...})`                |
| `__subclasses__()` | Subclases directas (método)            | `Movie.__subclasses__()` → `[]`                         |

```python
class Movie:
    genre = "drama"

Movie.__name__          # 'Movie'
Movie.__qualname__      # 'Movie'
Movie.__module__        # '__main__'
Movie.__bases__         # (<class 'object'>,)
Movie.__dict__          # mappingproxy({'genre': 'drama', '__module__': '__main__', ...})
```

### __slots__

`__slots__` restringe qué atributos puede tener una instancia. Ahorra memoria y evita errores tipográficos en los nombres de los atributos:

```python
class Movie:
    __slots__ = ("title", "year")

    def __init__(self, title, year):
        self.title = title
        self.year = year
```

```python
movie = Movie("Inception", 2010)
movie.title    # "Inception"
movie.year     # 2010

movie.genre = "action"   # AttributeError: 'Movie' object has no attribute 'genre'
```

> [!warning]
> Al usar `__slots__`, no puedes añadir atributos que no estén listados en `__slots__`. Además, no se crea `__dict__`, lo que significa que algunas funciones (como `vars()`) no funcionarán.

## Métodos especiales

Los métodos especiales permiten que tus clases interactúen con las funciones y operadores integrados de Python.

### Métodos especiales comunes

| Método                   | Disparador                 | Descripción                                          |
| ------------------------ | -------------------------- | ---------------------------------------------------- |
| `__init__`               | `MyClass()`                | Constructor: inicializa los atributos                |
| `__str__`                | `print(obj)`, `str(obj)`   | Cadena legible para humanos                          |
| `__repr__`               | `repr(obj)`, `print(list)` | Representación para desarrolladores (sin ambigüedad) |
| `__eq__`                 | `obj == other`             | Comparación de igualdad                              |
| `__ne__`                 | `obj != other`             | Comparación de desigualdad                           |
| `__lt__`                 | `obj < other`              | Menor que                                            |
| `__le__`                 | `obj <= other`             | Menor o igual que                                    |
| `__gt__`                 | `obj > other`              | Mayor que                                            |
| `__ge__`                 | `obj >= other`             | Mayor o igual que                                    |
| `__add__`                | `obj + other`              | Suma                                                 |
| `__sub__`                | `obj - other`              | Resta                                                |
| `__mul__`                | `obj * other`              | Multiplicación                                       |
| `__len__`                | `len(obj)`                 | Longitud                                             |
| `__getitem__`            | `obj[key]`                 | Acceso por índice                                    |
| `__setitem__`            | `obj[key] = val`           | Asignación por índice                                |
| `__contains__`           | `item in obj`              | Prueba de pertenencia                                |
| `__del__`                | `del obj`                  | Destructor (cuando el objeto es recolectado)         |
| `__enter__` / `__exit__` | `with obj:`                | Gestor de contexto (context manager)                 |

### \_\_str\_\_ y \_\_repr\_\_

`__str__` es para usuarios finales, `__repr__` es para desarrolladores. 

```python
class Movie:
    def __init__(self, title, year):
        self.title = title
        self.year = year

    def __str__(self):
        return f"{self.title} ({self.year})"

    def __repr__(self):
        return f"Movie('{self.title}', {self.year})"

movie = Movie("Inception", 2010)
print(movie)          # Inception (2010)  → usa __str__
print(repr(movie))    # Movie('Inception', 2010)  → usa __repr__
```

> [!tip]
> Si solo implementas uno, implementa `__repr__`, ya que se utiliza como alternativa para `__str__`.

### Operadores de comparación

```python
class Movie:
    def __init__(self, title, rating):
        self.title = title
        self.rating = rating

    def __eq__(self, other):
        return self.rating == other.rating

    def __lt__(self, other):
        return self.rating < other.rating

    def __gt__(self, other):
        return self.rating > other.rating
```

```python
movie1 = Movie("Inception", 9)
movie2 = Movie("Interstellar", 8)

movie1 == movie2   # False
movie1 > movie2    # True
movie1 < movie2    # False
```

> [!tip]
> Usa `@functools.total_ordering` en una clase para generar automáticamente los métodos de comparación restantes a partir de `__eq__` y uno de `__lt__`/`__gt__`:
> ```python
> from functools import total_ordering
> 
> @total_ordering
> class Movie:
>     def __eq__(self, other): return self.rating == other.rating
>     def __lt__(self, other): return self.rating < other.rating
> ```

### Operadores aritméticos

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
```

```python
v1 = Vector(1, 2)
v2 = Vector(3, 4)

v1 + v2    # Vector(4, 6)
v1 - v2    # Vector(-2, -2)
v1 * 3     # Vector(3, 6)
```

### Métodos de contenedor

```python
class Playlist:
    def __init__(self, songs):
        self.songs = songs

    def __len__(self):
        return len(self.songs)

    def __getitem__(self, index):
        return self.songs[index]

    def __setitem__(self, index, value):
        self.songs[index] = value

    def __contains__(self, song):
        return song in self.songs
```

```python
playlist = Playlist(["Song A", "Song B", "Song C"])

len(playlist)            # 3
playlist[0]              # "Song A"
playlist[1] = "Song X"   # modifica el índice 1
"Song A" in playlist     # True
```

> [!note]
> Implementar `__getitem__` hace que el objeto sea iterable. Entonces puedes usar `for song in playlist:` sin implementar `__iter__`.

### Gestores de contexto

```python
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode

    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.file.close()
```

```python
with FileManager("data.txt", "w") as f:
    f.write("hello")
# el archivo se cierra automáticamente
```

> Siguiente: [[Decorators]]
