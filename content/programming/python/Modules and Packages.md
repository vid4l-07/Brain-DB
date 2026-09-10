# Modules

A module is a single `.py` file. You can import functions, classes, and variables from it.

```python
# math_utils.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

PI = 3.14159
```

```python
# main.py
import math_utils

math_utils.add(3, 4)        # 7
math_utils.PI               # 3.14159
```

# Import styles

```python
import math_utils                    # import the whole module
from math_utils import add           # import specific function
from math_utils import add, subtract # import multiple
from math_utils import *             # import everything (avoid)
import math_utils as mu              # alias
```

> [!warning]
> Avoid `from module import *`. It pollutes the namespace and makes it hard to know where names come from.

# Special variables

Python modules have several special (dunder) variables that provide metadata about the module.
## __name__

Every module has a `__name__` variable. It equals `"__main__"` when the file is run directly, and the module name when imported.

```python
# math_utils.py
def add(a, b):
    return a + b

if __name__ == "__main__":
    # This code only runs when executing math_utils.py directly
    print(add(3, 4))   # 7
```

> [!tip]
> Use `if __name__ == "__main__":` to write code that runs both as a script and as an importable module.

| Scenario                             | `__name__` value |
| ------------------------------------ | ---------------- |
| Run directly: `python math_utils.py` | `"__main__"`     |
| Imported: `import math_utils`        | `"math_utils"`   |

## __file__

Contains the path of the current module file:

```python
# math_utils.py
print(__file__)   # "/home/user/project/math_utils.py"
```

> [!note]
> `__file__` is not defined in the interactive interpreter or in modules loaded by the C runtime (like `sys`).

## __all__

Controls what is exported with `from module import *`:

```python
# math_utils.py
__all__ = ["add", "subtract"]

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def internal_func():    # not exported
    pass
```

```python
from math_utils import *   # only imports add and subtract
```

> [!tip]
> Always define `__all__` in modules that might be imported with `from module import *`. It makes the public API explicit.

## __version__

Not built-in by convention, but widely used for versioning:

```python
# math_utils.py
__version__ = "1.2.0"

# You can also read it from pyproject.toml or importlib.metadata
```

# Packages

A package is a directory with an `__init__.py` file. It groups related modules.

```
my_project/
├── main.py
└── utils/
    ├── __init__.py
    ├── math_utils.py
    └── string_utils.py
```

# \_\_init\_\_.py

`__init__.py` controls what is exported when the package is imported. It can be empty or define `__all__`:

```python
# utils/__init__.py
__all__ = ["add", "subtract"]

from .math_utils import add, subtract
from .string_utils import capitalize_words   # not exported by default
```

> [!note]
> If `__init__.py` is empty, all modules in the directory are still importable. It mainly exists to mark the directory as a package.

# Relative imports

Inside a package, use relative imports with dots:

```python
# utils/math_utils.py
def add(a, b):
    return a + b
```

```python
# utils/string_utils.py
from .math_utils import add    # import from sibling module (same package)

def sum_and_capitalize(a, b):
    return str(add(a, b)).upper()
```

| Syntax                     | Meaning                         |
| -------------------------- | ------------------------------- |
| `from . import module`     | Same package                    |
| `from .. import module`    | Parent package                  |
| `from .module import func` | Specific name from same package |

> [!warning]
> Relative imports only work inside packages. They do not work in top-level scripts.

