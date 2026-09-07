# Variables

In Python, variables are created when you assign a value. No type declaration is needed.

```python
name = "Ana"        # str
age = 25            # int
height = 1.75       # float
is_student = True   # bool
```

> [!note]
> Python uses **dynamic typing**: the type is determined at runtime and can change with reassignment.

# Naming conventions

- Use `snake_case` for variables and functions.
- Start with a letter or `_`, never with a number.
- Names are case-sensitive (`name` ≠ `Name`).

```python
my_variable = 10      # valid
_private = 5          # valid (convention for internal use)
2name = "error"       # invalid
```

> [!warning]
> Avoid using Python keywords as variable names (`if`, `for`, `class`, `import`, etc.).

# Assignment

```python
x = 10                # simple assignment
x, y, z = 1, 2, 3    # multiple assignment
x = y = 0             # same value to multiple variables
x, *rest = [1, 2, 3, 4]  # x = 1, rest = [2, 3, 4]
```

# Swapping variables

Python allows swapping without a temporary variable:

```python
a = 5
b = 10
a, b = b, a   # a = 10, b = 5
```

# Scope

Variables have scope depending on where they are defined:

```python
global_var = "global"

def my_function():
    local_var = "local"        # only exists inside the function
    print(global_var)          # can read global variables

my_function()
print(global_var)              # works
# print(local_var)             # error: local_var is not defined
```

> [!tip]
> Use `global` to modify a global variable inside a function, but it is generally discouraged. Prefer passing values as parameters.

# Constants

Python has no real constants. By convention, use UPPER_CASE names:

```python
MAX_RETRIES = 3
PI = 3.14159
```

> [!warning]
> This is only a convention. Python does not prevent reassignment of UPPER_CASE variables.

> Next: [[programming/python/Data Types|Data Types]]
