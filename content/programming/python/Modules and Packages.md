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

# __name__

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

```python
# utils/__init__.py
from .math_utils import add
from .string_utils import capitalize_words
```

```python
# main.py
from utils import add, capitalize_words

add(3, 4)                        # 7
capitalize_words("hello world")  # "Hello World"
```

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

| Syntax | Meaning |
|--------|---------|
| `from . import module` | Same package |
| `from .. import module` | Parent package |
| `from .module import func` | Specific name from same package |

> [!warning]
> Relative imports only work inside packages. They do not work in top-level scripts.

# __init__.py

`__init__.py` controls what is exported when the package is imported. It can be empty or define `__all__`:

```python
# utils/__init__.py
__all__ = ["add", "subtract"]

from .math_utils import add, subtract
from .string_utils import capitalize_words   # not exported by default
```

> [!note]
> If `__init__.py` is empty, all modules in the directory are still importable. It mainly exists to mark the directory as a package.

# Standard library highlights

| Module        | Description                             |
| ------------- | --------------------------------------- |
| `os`          | File system, environment variables      |
| `sys`         | System parameters, `sys.path`           |
| `math`        | Math functions (`sqrt`, `sin`, `pi`)    |
| `datetime`    | Dates and times                         |
| `json`        | JSON parsing and serialization          |
| `re`          | Regular expressions                     |
| `pathlib`     | Modern file path handling               |
| `collections` | `deque`, `Counter`, `namedtuple`        |
| `itertools`   | Iteration tools (`chain`, `product`)    |
| `functools`   | `reduce`, `lru_cache`, `total_ordering` |