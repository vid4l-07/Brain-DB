# ¿Qué es un decorador?

Un decorador es una función que toma otra función y extiende su comportamiento sin modificarla. Los decoradores se aplican con la sintaxis `@`.

```python
def my_decorator(func):
    def wrapper():
        print("Before function call")
        func()
        print("After function call")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
# Antes de la llamada a la función
# Hello!
# Después de la llamada a la función
```

> [!note]
> `@my_decorator` equivale a `say_hello = my_decorator(say_hello)`.

# Cómo funcionan los decoradores

Un decorador es simplemente una función de orden superior. Recibe una función, añade comportamiento y devuelve una nueva función:

```python
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} tardó {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(1)

slow_function()   # "slow_function tardó 1.0012s"
```

> [!tip]
> Usa siempre `*args, **kwargs` en el wrapper para pasar todos los argumentos a la función decorada.

# Preservar metadatos

Los decoradores reemplazan la función original, perdiendo su nombre y su docstring. Usa `functools.wraps` para preservarlos:

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

> [!warning]
> Usa siempre `@wraps(func)` en tus decoradores. Sin ello, las herramientas de depuración y los generadores de documentación no funcionarán correctamente.

# Decoradores integrados

## @staticmethod

Define un método que no accede a `self` ni a `cls`. Es simplemente una función que vive dentro de la clase por motivos organizativos:

```python
class Math:
    @staticmethod
    def add(a, b):
        return a + b

Math.add(3, 4)        # 7
Math().add(3, 4)      # 7 (también funciona en instancias)
```

> [!tip]
> Usa `@staticmethod` cuando el método no necesite acceso a datos de la instancia o de la clase, pero pertenezca lógicamente a la clase.

## @classmethod

Define un método que recibe la **clase** (`cls`) como primer argumento en lugar de la instancia (`self`):

```python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, date_string):
        year, month, day = map(int, date_string.split("-"))
        return cls(year, month, day)

    def __str__(self):
        return f"{self.year}-{self.month:02d}-{self.day:02d}"

date = Date.from_string("2025-03-15")
print(date)   # 2025-03-15
```

> [!note]
> Los métodos de clase se usan comúnmente como **métodos de fábrica** (factory methods) que proporcionan formas alternativas de crear instancias.

## @property

Permite acceder a un método como si fuera un atributo. Crea un atributo gestionado con getter, setter y deleter:

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        """Getter: se llama al acceder a circle.radius"""
        return self._radius

    @radius.setter
    def radius(self, value):
        """Setter: se llama al asignar circle.radius = value"""
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        """Propiedad de solo lectura (sin setter)"""
        return 3.14159 * self._radius ** 2
```

```python
c = Circle(5)
c.radius         # 5 (llama al getter)
c.radius = 10    # llama al setter
c.area           # 314.159 (solo lectura, sin setter definido)

c.radius = -1    # ValueError: Radius cannot be negative
c.area = 100     # AttributeError: can't set attribute
```

> [!tip]
> Usa `@property` para validar datos, calcular valores de forma diferida (lazy) o proporcionar una interfaz de solo lectura a atributos internos.

# Otros decoradores integrados comunes

| Decorador              | Descripción                                              |
| ---------------------- | -------------------------------------------------------- |
| `@functools.lru_cache` | Almacena en caché los resultados de llamadas costosas    |
| `@abc.abstractmethod`  | Define métodos abstractos en clases base                  |
| `@dataclass`           | Genera métodos comunes para clases de datos              |

> Siguiente: [[programación/python/Objects|Objects]]
