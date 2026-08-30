# Pointers

Pointers store the **memory address** where a variable is located.

## Address operator `&` and dereference operator `*`

```cpp
int number = 5;
std::cout << &number; // & returns the memory address

int* p = &number;  // p is a pointer, stores the memory address
int *q = &number;  // same definition as before

std::cout << *p;  // * returns the value at that memory address
*p = 10;  // changes the value at that memory address
```

## Declaring multiple pointers

```cpp
int* p1, p2; // only p1 is a pointer
int *p3, *p4; // both are pointers
```

## Null pointer

```cpp
int* nullPointer = nullptr; // safe empty pointer
```

> [!warning]
> Dereferencing (`*`) a null or invalid pointer is undefined behavior and usually causes a crash (segfault).

# References

A **reference** (`&`) is an alias for an existing variable. It is like a pointer that cannot be redirected and cannot be null.

```cpp
int number = 5;
int& ref = number;   // ref is an alias for 'number'
ref = 10;            // modifies 'number', which is now 10

std::cout << number; // 10
```

# References vs pointers

| Feature             | Reference `int&`   | Pointer `int*`        |
| ------------------- | ------------------- | --------------------- |
| Can be null         | No                 | Yes (`nullptr`)       |
| Can be redirected   | No                 | Yes (`p = &other`)    |
| Access syntax       | Same as variable   | Requires `*`/`->`     |
| Initial value       | Required           | Optional              |

# Pass by reference

Passing parameters **by reference** avoids copying the data (key for efficiency) and allows modifying it within the function:

```cpp
void increment(int& n) {  // n is a reference
    n++;
}

int x = 5;
increment(x);  // x is now 6
```

> [!note]
> Using `const` with references in parameters allows reading without copying or modifying: `void display(const std::string& s)`. This is the most common way to pass large objects to functions.

> [!warning]
> In C++ pointers and references are manual: the compiler does not automatically check if they point to valid memory. You are responsible for ensuring they are valid and for not dereferencing null or freed pointers.

> Next: [[programming/c++/Dynamic Memory and Smart Pointers|Dynamic Memory and Smart Pointers]]
