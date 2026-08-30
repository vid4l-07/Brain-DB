**Namespaces** allow grouping variables, functions, and types under a name, preventing name conflicts between different parts of the code or libraries.

# Definition and usage

```cpp
namespace group {
    int var1 = 10;  // Variable in the group namespace
}

namespace another_group {
    double var2 = 2.3; // Variable in the another_group namespace
}
```

To access variables from a namespace, use the `namespace::` prefix:

```cpp
auto variable1 = group::var1;
double variable2 = another_group::var2; // Access variable from another namespace
```

# Using namespace

Allows using variables from a namespace without the prefix:

```cpp
using namespace group; // Use variables from group namespace without the group:: prefix
int var3 = var1;       // var1 from the group namespace
```

> [!note]
> `std` (from the standard library) is a namespace. Types like `std::string`, `std::vector`, or `std::cout` use the `std::` prefix precisely because of this.

> [!warning]
> Avoid overusing `using namespace` in large programs: it can cause ambiguities when two namespaces define the same name.

> Next: [[programming/c++/Exceptions and Errors|Exceptions and Errors]]
