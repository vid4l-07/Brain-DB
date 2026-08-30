# Exceptions

Error handling in C++ is based on three keywords: `try`, `throw`, and `catch`.

# Syntax

```cpp
try {
    int divisor = 0;
    if (divisor == 0) {
        throw std::runtime_error("Error: division by zero"); // Throws an exception
    }
    int result = 10 / divisor; // Won't execute if divisor == 0
    std::cout << "Result: " << result << "\n";
}

catch (const std::runtime_error& e) { // Catches the specific exception
    std::cout << "Caught runtime_error: " << e.what() << "\n";
}

catch (const std::exception& e) { // Catches any other exception derived from std::exception
    std::cout << "Caught standard exception: " << e.what() << "\n";
}

catch (...) { // Catches any other unknown exception
    std::cout << "Caught unknown error\n";
}
```

# Concepts

1. `try`: Block where an error may occur.
2. `throw`: Throws an exception.
3. `catch`: Catches the exception and handles it.
4. The `catch(...)` block catches any exception not handled by the previous `catch` blocks.

> [!note]
> `catch` blocks are evaluated in order, from most specific to most general. The exception is caught by the first matching `catch`.

# STL Exceptions

The standard library defines predefined exceptions, such as `std::out_of_range` (out-of-bounds access) or `std::invalid_argument`:

```cpp
std::vector<int> v = {1, 2, 3};
try {
    std::cout << v.at(10); // .at(10) throws std::out_of_range
} catch (const std::out_of_range& e) {
    std::cout << "Index out of bounds\n";
}
```

> [!warning]
> In C++ exceptions propagate automatically if not caught, which terminates the program (`std::terminate`) if there is no `catch`.

> Next: [[programming/c++/Pointers and References|Pointers and References]]
