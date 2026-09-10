# What is a decorator?

A decorator is a function that takes another function and extends its behavior without modifying it. Decorators are applied with the `@` syntax.

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
# Before function call
# Hello!
# After function call
```

> [!note]
> `@my_decorator` is equivalent to `say_hello = my_decorator(say_hello)`.

# How decorators work

A decorator is just a higher-order function. It receives a function, adds behavior, and returns a new function:

```python
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(1)

slow_function()   # "slow_function took 1.0012s"
```

> [!tip]
> Always use `*args, **kwargs` in the wrapper to pass all arguments to the decorated function.

# Preserving metadata

Decorators replace the original function, losing its name and docstring. Use `functools.wraps` to preserve them:

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

> [!warning]
> Always use `@wraps(func)` in your decorators. Without it, debugging tools and documentation generators won't work correctly.

# Built-in decorators

## @staticmethod

Defines a method that doesn't access `self` or `cls`. It's just a function that lives inside the class for organizational purposes:

```python
class Math:
    @staticmethod
    def add(a, b):
        return a + b

Math.add(3, 4)        # 7
Math().add(3, 4)      # 7 (works on instances too)
```

> [!tip]
> Use `@staticmethod` when the method doesn't need access to instance or class data, but logically belongs to the class.

## @classmethod

Defines a method that receives the **class** (`cls`) as the first argument instead of the instance (`self`):

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
> Class methods are commonly used as **factory methods** that provide alternative ways to create instances.

## @property

Allows you to access a method like an attribute. It creates a managed attribute with getter, setter, and deleter:

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        """Getter: called when accessing circle.radius"""
        return self._radius

    @radius.setter
    def radius(self, value):
        """Setter: called when assigning circle.radius = value"""
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        """Read-only property (no setter)"""
        return 3.14159 * self._radius ** 2
```

```python
c = Circle(5)
c.radius         # 5 (calls getter)
c.radius = 10    # calls setter
c.area           # 314.159 (read-only, no setter defined)

c.radius = -1    # ValueError: Radius cannot be negative
c.area = 100     # AttributeError: can't set attribute
```

> [!tip]
> Use `@property` to validate data, compute values lazily, or provide a read-only interface to internal attributes.

# Other common built-in decorators

| Decorator              | Description                               |
| ---------------------- | ----------------------------------------- |
| `@functools.lru_cache` | Cache results of expensive function calls |
| `@abc.abstractmethod`  | Define abstract methods in base classes   |
| `@dataclass`           | Generate common methods for data classes  |

> Next: [[programming/python/Objects|Objects]]
