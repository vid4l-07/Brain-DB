# Definition and calling

Functions are defined by specifying the return type, the name, and the parameters in parentheses. The main function is `main`.

```cpp
// Function that adds two integers
int sum(int x, int y) {
    return x + y;
}

// Function that returns true if the number is positive
bool isPositive(int n) {
    return n > 0;
}

int main() {  // Main function
    int sumResult = sum(3, 4);
    bool isPos = isPositive(-5);

    std::cout << "Sum: " << sumResult << ", isPositive(-5): " << isPos << "\n";
}
```

> [!note]
> `main` is the program's entry point. Returning `0` indicates it finished correctly, and any other value indicates an error:
> ```cpp
> return 0;  // Terminate the program successfully
> return 1;  // Terminate with error
> return 2;  // Terminate with another type of error
> ```

> [!warning]
> In C++ each function must be declared (or defined) **before** using it. If you use a function without declaring it first, the compiler gives an error. This is usually solved with prototypes or headers.

# Default parameters

You can give default values to trailing parameters:

```cpp
int power(int base, int exp = 2) { // exp is 2 if not provided
    int r = 1;
    for (int i = 0; i < exp; i++) r *= base;
    return r;
}
power(3);     // 3^2 = 9
power(3, 4);  // 3^4 = 81
```

# Overloading

Multiple functions with the same name can exist if they differ in parameter type or number:

```cpp
int sum(int a, int b) { return a + b; }
double sum(double a, double b) { return a + b; } // Same overload
```

# Lambda functions

Lambda functions have no name, are defined where they are used, and can **capture** variables from the surrounding environment.

## Syntax

```cpp
[capture](parameters) -> return_type { function body }
```

- **Capture** (in brackets): which variables from the environment are used.
- **Parameters** and **return type** are optional (can be deduced).

## Capture

| Capture | Description                                             |
| ------- | ------------------------------------------------------- |
| `[=]`   | Captures all environment variables by value             |
| `[&]`   | Captures all environment variables by reference         |
| `[var]` | Captures variable `var` by value                        |
| `[&var]`| Captures variable `var` by reference                    |

## Examples

```cpp
// Lambda that adds two numbers
auto sum = [](int a, int b) -> int { return a + b; };
std::cout << sum(5, 3); // 8

// Lambda that captures an environment variable
int factor = 2;
auto multiply = [factor](int x) -> int { return x * factor; };
std::cout << multiply(5); // 10

// Lambda with no parameters
auto greet = []() { std::cout << "Hello, world!"; };
greet();
```

> Next: [[programming/c++/Namespaces|Namespaces]]
