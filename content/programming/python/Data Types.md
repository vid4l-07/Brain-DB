# Basic data types

| Type       | Description    | Example          |
| ---------- | -------------- | ---------------- |
| `int`      | Integer        | `42`             |
| `float`    | Floating point | `3.14`           |
| `str`      | String         | `"hello"`        |
| `bool`     | Boolean        | `True` / `False` |
| `NoneType` | Null value     | `None`           |

```python
x = 10          # int
y = 3.14        # float
s = "hello"     # str
b = True        # bool
n = None        # NoneType
```

# Type checking

## isinstance()

```python
isinstance(42, int)             # True
isinstance(3.14, float)         # True
isinstance(42, (int, float))    # True (checks multiple types)
isinstance("hi", str)           # True
```

> [!tip]
> `isinstance()` is the recommended way to check types because it supports inheritance.

## type()

```python
type(42)            # <class 'int'>
type(42).__name__   # "int" (returns the type name as a string)

# Custom type check
def is_type(value, type_str):
    return type(value).__name__ == type_str

is_type(5, "int")   # True
```

> [!warning]
> `type()` does not account for inheritance. Use `isinstance()` when possible.

# Type conversion

```python
int("42")       # str → int: 42
float("3.14")   # str → float: 3.14
str(42)         # int → str: "42"
bool(1)         # int → bool: True
bool(0)         # int → bool: False
bool("")        # str → bool: False
bool("hello")   # str → bool: True
list("abc")     # str → list: ['a', 'b', 'c']
tuple([1,2])    # list → tuple: (1, 2)
```

> [!note]
> `bool()` returns `False` for empty values: `0`, `0.0`, `""`, `[]`, `{}`, `()`, `None`.

# Numeric validation

## Checking if a string is a number

```python
def is_integer(s):
    return s.isdigit()   # True if all characters are digits

def is_float(s):
    parts = s.split(".")
    return len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit()

is_integer("123")    # True
is_integer("12.3")   # False
is_float("3.14")     # True
is_float("3.1.4")    # False
```

> [!tip]
> For negative numbers, strip the leading `-` before checking: `s.lstrip("-").isdigit()`.

# Integer details

```python
x = 42          # decimal
y = 0b1010      # binary (10)
z = 0o12        # octal (10)
w = 0xA         # hexadecimal (10)

large = 1_000_000   # underscores as thousand separators (readability)
```

> [!note]
> Python integers have **arbitrary precision**: they can be as large as memory allows, with no overflow.

# Float details

```python
x = 3.14
y = 2.5e10       # scientific notation: 2.5 × 10^10
z = 1.2e-4       # 0.00012
```

> [!warning]
> Floating point arithmetic can have precision issues:
> ```python
> 0.1 + 0.2   # 0.30000000000000004 (not exactly 0.3)
> ```
> Use `round()` or the `decimal` module for precise calculations.

> Next: [[programming/python/Strings|Strings]]
