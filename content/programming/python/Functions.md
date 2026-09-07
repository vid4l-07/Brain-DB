# Definition and calling

```python
def sum(x, y):
    return x + y

result = sum(3, 4)   # 7
```

> [!note]
> Functions are defined with `def`, followed by the name, parameters in parentheses, and a colon. The body is indented.

# Default parameters

```python
def power(base, exp=2):   # exp is 2 if not provided
    return base ** exp

power(3)      # 9
power(3, 4)   # 81
```

> [!warning]
> Default parameters are evaluated once at function definition, not at each call. Avoid mutable defaults like `[]` or `{}`:
> ```python
> def bad(x, lst=[]):   # don't do this
>     lst.append(x)
>     return lst
> ```

# *args and **kwargs

## *args

Receives any number of **positional** arguments as a tuple:

```python
def sum_all(*args):
    return sum(args)

sum_all(1, 2, 3)       # 6
sum_all(1, 2, 3, 4, 5) # 15
```

## **kwargs

Receives any number of **keyword** arguments as a dictionary:

```python
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Ana", age=25)
# name: Ana
# age: 25
```

## Combined

```python
def func(a, b, *args, **kwargs):
    print(a, b, args, kwargs)

func(1, 2, 3, 4, x=5, y=6)
# 1 2 (3, 4) {'x': 5, 'y': 6}
```

> [!tip]
> The order must be: positional, `*args`, keyword, `**kwargs`.

# Lambda functions

Anonymous functions defined with `lambda`:

```python
square = lambda x: x ** 2
square(5)   # 25

add = lambda a, b: a + b
add(3, 4)   # 7
```

> [!note]
> Lambdas are useful for short, one-line functions. They are commonly used with `sorted()`, `map()`, `filter()`:
> ```python
> pairs = [(1, "b"), (2, "a"), (3, "c")]
> sorted(pairs, key=lambda pair: pair[1])   # [(2, 'a'), (1, 'b'), (3, 'c')]
> ```

# Scope

```python
x = 10

def func():
    x = 20        # local variable (different from global x)
    print(x)      # 20

func()
print(x)          # 10 (global x unchanged)
```

## global

```python
x = 10

def func():
    global x
    x = 20        # modifies the global x

func()
print(x)          # 20
```

> [!warning]
> Avoid using `global` when possible. Prefer passing values as parameters and returning results.

# Higher-order functions

Functions that take or return other functions:

```python
def apply(func, value):
    return func(value)

apply(lambda x: x ** 2, 5)   # 25
```

## map, filter, reduce

```python
numbers = [1, 2, 3, 4, 5]

# map: apply a function to each element
squared = list(map(lambda x: x ** 2, numbers))   # [1, 4, 9, 16, 25]

# filter: keep elements where the function returns True
evens = list(filter(lambda x: x % 2 == 0, numbers))   # [2, 4]

# reduce: accumulate a result (requires import)
from functools import reduce
total = reduce(lambda a, b: a + b, numbers)   # 15
```

# Type hints

Specify the returning type of a function:
```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

> [!note]
> Type hints are optional and not enforced at runtime. They are useful for documentation and static analysis tools.

> Next: [[programming/python/Classes|Classes]]
