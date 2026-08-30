# Basic data types

| Type              | Description                                  |
| ----------------- | -------------------------------------------- |
| `int`             | Signed integer                               |
| `float`           | Floating point (less precise than `double`)  |
| `double`          | Double-precision floating point              |
| `char`            | Single character (single quotes `'A'`)       |
| `bool`            | Boolean (`true` / `false`)                   |
| `std::string`     | String (requires `#include <string>`)        |
| `long`            | Larger signed integer                        |
| `short`           | Smaller signed integer                       |
| `unsigned int`    | Unsigned integer (positive)                  |

```cpp
float f = 3.14f;      // float (less precise than double but uses less memory) the "f" indicates it's a float
char letter = 'A';    // char (single quotes)
bool boolean = true;

std::string greeting = "Hello"; // std::string requires std:: because it's in the string library namespace
```

# Uniform initialization (C++11)

```cpp
int x{5};
double y{2.71};
```

# Declaring without initializing

```cpp
int var;      // Declare variable (without initializing)
std::cin >> var; // Read value from input
```

# auto

`auto` deduces the type automatically, without writing it by hand:

```cpp
auto code = 65;    // auto detects the type automatically (int in this case)
char character = code; // interprets 65 as char 'A' in ASCII

auto name = std::string("Ana"); // auto deduces std::string
```

It is especially useful with long types or iterators:

```cpp
auto it = vec.begin(); // instead of std::vector<int>::iterator it
```

> [!tip]
> `auto` deduces the type at compile time; once deduced it is as if you had written the type by hand. The type does not change at runtime.

> [!note]
> `auto` can be combined with `const` and `&` (references), for example `const auto& x = vec;`. This is seen in [[programming/c++/Arrays and Vectors|Arrays and Vectors]].

# Implicit conversion

In C++ types can be implicitly converted.

```cpp
int value = 1;
bool boolean = value; // true (any value different from 0)

if (value) {
    std::cout << "value is true\n";
}
```

> [!warning]
> In C++ any value different from `0` is converted to `true` in a boolean context. Be careful with these implicit conversions, as a non-zero integer is always evaluated as true.

# Constants

They are declared with `const` or `constexpr`.

## const

Value that does not change **at runtime**:

```cpp
const int e = 2;
```

## constexpr

Value computed **at compile time**, which can improve performance:

```cpp
constexpr double pi = 3.14;
constexpr int square(int n) { return n * n; } // 'constexpr' function
int area = square(5); // computed at compile time
```

> [!note]
> `constexpr` guarantees the value is known at compile time, while `const` only guarantees it doesn't change. `constexpr` implies `const`, but not the other way around.

# Macros

Macros replace text in the code **before** compilation. They are defined with `#define`:

```cpp
#define PI 3.14 // Define a constant with a macro
int area = PI * 5 * 5; // Use the macro to calculate the area of a circle with radius 5

#define MAX(a, b) ((a) > (b) ? (a) : (b)) // Macro to get the maximum of two values
int maxVal = MAX(10, 20); // maxVal = 20
```

> [!warning]
> It is not recommended to use macros for constants, better to use `const` or `constexpr`. Macros do not respect type or scope and are expanded textually.

> Next: [[programming/c++/Strings|Strings]]
