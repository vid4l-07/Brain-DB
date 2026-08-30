**Templates** allow writing generic code that can work with different data types without duplicating the code for each specific type.

# Variables

```cpp
template <typename T>
T pi = T(3.1415926535897932385);
```

```cpp
std::cout << pi<float>; // Specifies that T is float
```

# Functions

```cpp
template <typename T> // Generic type T
T add(T a, T b) {
    return a + b;
}

template <typename T, typename I> // Generic types T and I
T multiply(T a, I b) {
    return a * b;
}
```

The type can be explicitly specified or deduced from the arguments:

```cpp
int x = add<int>(5, 10); // Specifies that T is int
double y = add(3.5, 2.5); // T is automatically deduced as double

int z = multiply<int, float>(4, 5.5); // Specifies that T is int and I is float
double w = multiply(2.5, 3); // T is deduced as double
```

# Classes

```cpp
template <typename T = int> // Generic type T with default value int
class Box {
    T value;

public:
    Box(T value) : value(value) {}
    T getValue() {
        return value;
    }
};
```

```cpp
Box<float> floatBox(123.5); // Specifies that T is float
std::cout << floatBox.getValue(); // Prints 123

Box<> defaultBox(42); // Uses the default int value for T
std::cout << defaultBox.getValue(); // Prints 42
```

> Next: [[programming/c++/Containers Iterators and Algorithms|Containers Iterators and Algorithms]]
