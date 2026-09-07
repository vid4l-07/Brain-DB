# Strings

Strings in Python are **immutable** sequences of characters.

```python
s = "Hello, world!"
s2 = 'Single quotes work too'
s3 = """Multi-line
string"""
```

# Accessing characters

```python
s = "Hello"
s[0]       # 'H'
s[-1]      # 'o' (last character)
```

> [!warning]
> Strings are immutable. `s[0] = 'h'` raises a `TypeError`.

# Slicing

```python
s = "Hello, world!"
s[0:5]      # "Hello" (from 0 to 5, excluding 5)
s[7:]       # "world!" (from 7 to the end)
s[:5]       # "Hello" (from the start to 5)
s[-6:]      # "world!" (last 6 characters)
s[::2]      # "Hlo ol!" (every 2nd character)
s[::-1]     # "!dlrow ,olleH" (reversed string)
```

# Basic operations

```python
a = "Hello"
b = "World"

a + " " + b       # "Hello World" (concatenation)
a * 3             # "HelloHelloHello" (repetition)
len(a)            # 5 (length)
"l" in a          # True (membership check)
```

# String methods

## Case

```python
s = "Hello, World!"
s.upper()         # "HELLO, WORLD!"
s.lower()         # "hello, world!"
s.capitalize()    # "Hello, world!" (first letter uppercase, rest lowercase)
s.title()         # "Hello, World!" (each word capitalized)
s.swapcase()      # "hELLO, wORLD!"
```

## Search and replace

```python
s = "Hello, World!"

s.find("World")       # 7 (index of first occurrence, -1 if not found)
s.rfind("l")          # 3 (index of last occurrence)
s.count("l")          # 3 (number of occurrences)
s.replace("World", "Python")   # "Hello, Python!"
```

## Whitespace

```python
s = "  Hello, World!  "
s.strip()         # "Hello, World!" (remove leading/trailing whitespace)
s.lstrip()        # "Hello, World!  " (remove left whitespace)
s.rstrip()        # "  Hello, World!" (remove right whitespace)
```

> [!tip]
> `strip()` also removes tabs `\t` and newlines `\n`.

## Split and join

```python
s = "Hello, World!"
s.split(", ")          # ["Hello", "World!"]

words = ["Hello", "World"]
", ".join(words)       # "Hello, World"
```

## Validation

```python
"hello".isalpha()      # True (all characters are letters)
"123".isdigit()        # True (all characters are digits)
"hello123".isalnum()   # True (all characters are alphanumeric)
"  ".isspace()         # True (all characters are whitespace)
```

# String formatting

## f-strings (Python 3.6+)

```python
name = "Ana"
age = 25
f"{name} is {age} years old"       # "Ana is 25 years old"
f"{3.14159:.2f}"                    # "3.14" (2 decimal places)
f"{1000000:,}"                      # "1,000,000" (thousands separator)
f"{'hello':>10}"                    # "     hello" (right-aligned, width 10)
f"{'hello':<10}"                    # "hello     " (left-aligned)
f"{'hello':^10}"                    # "  hello   " (centered)
```

## format()

```python
"{} is {} years old".format(name, age)
"{1} {0}".format("world", "hello")   # "hello world"
```

# Conversion

```python
str(42)             # "42"
str(3.14)           # "3.14"
"42".isdigit()      # True

# To number
int("42")           # 42
float("3.14")       # 3.14
```

> Next: [[Data Structures|Data Structures]]
