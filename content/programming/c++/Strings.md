# std::string

The `std::string` class represents text strings. Requires `#include <string>`.

```cpp
std::string greeting = "Hello";
std::string name("Ana"); // Another way to create a string
```

# Basic operations

```cpp
std::string a = "Hello";
std::string b = "World";

std::string c = a + " " + b;      // Concatenation: "Hello World"
int len = a.size();               // String length (also length())

a += "!";                         // Append to end: "Hello!"
```

# Character access

```cpp
char first = a[0];       // First character (no bounds checking)
char second = a.at(1);   // Second character (throws exception if index doesn't exist)
char last = a.back();    // Last character
```

# Comparison

You can compare directly with `==`, `!=`, `<`, etc. (lexicographic order):

```cpp
if (a == b) { /* ... */ }
bool starts = a.starts_with("Ho"); // C++20: starts with "Ho"?
bool ends  = a.ends_with("la");    // C++20: ends with "la"?
```

# Substrings and searching

```cpp
std::string sub = a.substr(0, 4);      // Substring from position 0, length 4
size_t pos = a.find("World");          // Position of "World", or std::string::npos if not found
std::string replacement = "Hello World";
replacement.replace(5, 5, "C++");      // Replaces from 5, 5 characters => "Hello C++"
```

> [!warning]
> `find` returns `std::string::npos` (a huge number) if the substring is not found. Do not compare it directly with `-1`.

# Conversion

```cpp
int num = std::stoi("42");           // string → int
double d = std::stod("3.14");        // string → double
std::string s = std::to_string(42);  // number → string
```

> [!note]
> `std::string` is a single class that can grow dynamically. Literals like `"Hello"` are actually `const char*` (a character array), but they are implicitly converted to `std::string`.

> [!tip]
> `std::string` manages its memory automatically ([[programming/c++/Dynamic Memory and Smart Pointers|Dynamic Memory and Smart Pointers]]), so there is no need to free it manually.

> Next: [[programming/c++/Arrays and Vectors|Arrays and Vectors]]
