# Definition

Classes are blueprints for creating objects. They define attributes (data) and methods (behavior).

```python
class Movie:
    title: str
    director: str
    year: int
```

# __init__

The `__init__` method is the **constructor**. It initializes the attributes when an object is created.

```python
class Movie:
    def __init__(self, title: str, director: str, year: int):
        self.title = title
        self.director = director
        self.year = year
```

> [!note]
> `self` refers to the **current instance** of the class. It must be the first parameter of every method.

# Creating instances

```python
movie = Movie("The Godfather", "Francis Ford Coppola", 1972)
print(movie.title)   # "The Godfather"
```

# Instance methods

A method that is called on an instance of a type and can access its data.

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

# Attribute types

## Instance attributes

Unique to each object, defined in `__init__`:

```python
class Movie:
    def __init__(self, title):
        self.title = title   # instance attribute
```

## Class attributes

Shared by all instances of the class, defined outside methods:

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
> If you modify a class attribute through an instance, it creates a **new instance attribute** that shadows the class attribute. Always modify class attributes through the class name.

# Dunder

Dunder is a Python term for names surrounded by double underscores.
## Special attributes

Python objects have built-in attributes that provide metadata about the object or class. These are not methods, they are properties or classes.

### Instance attributes

```python
class Movie:
    def __init__(self, title, year):
        self.title = title
        self.year = year

movie = Movie("Inception", 2010)
```

| Attribute    | Description                       | Example                                                   |
| ------------ | --------------------------------- | --------------------------------------------------------- |
| `__class__`  | The class of the instance         | `movie.__class__` → `<class 'Movie'>`                     |
| `__dict__`   | Dictionary of instance attributes | `movie.__dict__` → `{'title': 'Inception', 'year': 2010}` |
| `__sizeof__` | Size in bytes                     | `movie.__sizeof__()` → `48`                               |

```python
movie = Movie("Inception", 2010)

movie.__class__          # <class '__main__.Movie'>
movie.__dict__           # {'title': 'Inception', 'year': 2010}
isinstance(movie, Movie) # True (uses __class__)
```

> [!tip]
> `__dict__` is useful for debugging or dynamically accessing all attributes. You can iterate over it like any dictionary.

### Class attributes

`<class 'name'>`

```python
class Movie:
    genre = "drama"

    def __init__(self, title):
        self.title = title
```

| Attribute          | Description                 | Example                                                 |
| ------------------ | --------------------------- | ------------------------------------------------------- |
| `__name__`         | Name of the class           | `Movie.__name__` → `'Movie'`                            |
| `__qualname__`     | Qualified name (with scope) | `Movie.__qualname__` → `'Movie'`                        |
| `__module__`       | Module where defined        | `Movie.__module__` → `'__main__'`                       |
| `__bases__`        | Tuple of parent classes     | `Movie.__bases__` → `(object,)`                         |
| `__mro__`          | Method Resolution Order     | `Movie.__mro__` → `(<class 'Movie'>, <class 'object'>)` |
| `__dict__`         | Class attribute dictionary  | `Movie.__dict__` → `mappingproxy({...})`                |
| `__subclasses__()` | Direct subclasses (method)  | `Movie.__subclasses__()` → `[]`                         |

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

`__slots__` restricts which attributes an instance can have. It saves memory and prevents typos in attribute names:

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
> When using `__slots__`, you cannot add attributes not listed in `__slots__`. Also, `__dict__` is not created, which means some features (like `vars()`) won't work.

## Special methods

Special methods let your classes interact with Python's built-in functions and operators.

### Common special methods

| Method                   | Trigger                    | Description                                   |
| ------------------------ | -------------------------- | --------------------------------------------- |
| `__init__`               | `MyClass()`                | Constructor: initialize attributes            |
| `__str__`                | `print(obj)`, `str(obj)`   | Human-readable string                         |
| `__repr__`               | `repr(obj)`, `print(list)` | Developer representation (unambiguous)        |
| `__eq__`                 | `obj == other`             | Equality comparison                           |
| `__ne__`                 | `obj != other`             | Inequality comparison                         |
| `__lt__`                 | `obj < other`              | Less than                                     |
| `__le__`                 | `obj <= other`             | Less than or equal                            |
| `__gt__`                 | `obj > other`              | Greater than                                  |
| `__ge__`                 | `obj >= other`             | Greater than or equal                         |
| `__add__`                | `obj + other`              | Addition                                      |
| `__sub__`                | `obj - other`              | Subtraction                                   |
| `__mul__`                | `obj * other`              | Multiplication                                |
| `__len__`                | `len(obj)`                 | Length                                        |
| `__getitem__`            | `obj[key]`                 | Index access                                  |
| `__setitem__`            | `obj[key] = val`           | Index assignment                              |
| `__contains__`           | `item in obj`              | Membership test                               |
| `__del__`                | `del obj`                  | Destructor (when object is garbage collected) |
| `__enter__` / `__exit__` | `with obj:`                | Context manager                               |

### \_\_str\_\_ and \_\_repr\_\_

`__str__` is for end users, `__repr__` is for developers. 

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
print(movie)          # Inception (2010)  → uses __str__
print(repr(movie))    # Movie('Inception', 2010)  → uses __repr__
```

> [!tip]
> If you only implement one, implement `__repr__`, it is used as a fallback for `__str__`.

### Comparison operators

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
> Use `@functools.total_ordering` on one class to auto-generate the remaining comparison methods from `__eq__` and one of `__lt__`/`__gt__`:
> ```python
> from functools import total_ordering
> 
> @total_ordering
> class Movie:
>     def __eq__(self, other): return self.rating == other.rating
>     def __lt__(self, other): return self.rating < other.rating
> ```

### Arithmetic operators

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

### Container methods

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
playlist[1] = "Song X"   # modifies index 1
"Song A" in playlist     # True
```

> [!note]
> Implementing `__getitem__` makes the object iterable. You can then use `for song in playlist:` without implementing `__iter__`.

### Context managers

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
# file is automatically closed
```

> Next: [[Decorators]]
