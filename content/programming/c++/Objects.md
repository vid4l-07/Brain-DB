**Structures** (`struct`) and **classes** (`class`) are data types that can contain multiple variables (members) and related functions (methods).

> [!note]
> The main difference between them is that classes allow **inheritance**, **polymorphism**, and **encapsulation**, while structures do not. Additionally, structure members are **public by default** and class members are **private by default**.

# Structure

Public by default, does not require member functions or constructors (though they can be added manually). Usually used to store simple data without needing encapsulation or complex methods.

```cpp
struct Person {
	    std::string name;  // Public member
	private:  // Private members
		std::string address;
};
```

# Class

Private by default, can contain methods and constructors, and has access to **inheritance**, **polymorphism**, and **encapsulation**.

```cpp
class Animal {
	    int id;  // Private member 
	
	public:  // Public members
	    std::string species;
	    int age;
};
```

# Constructors

The **constructor** initializes the object when created. It has the same name as the class and returns nothing.

```cpp
class Person {
public:
    std::string name;
    Person() { name = "Unknown"; }      // Default constructor
    Person(std::string n) : name(n) {}   // Constructor with parameter
    Person(const Person& other) : name(other.name) {} // Copy
};
```

## Initialization list

Initializes members **before** executing the constructor body. It is the recommended way:

```cpp
class Person {
    std::string name;
public:
    Person(std::string n) : name(n) {} // initializes name with n
};
```

# Pointers to objects

```cpp
Animal a("Dog", 5);
std::cout << a.species;      // We use . on objects
a.greet();

Animal* ptr = &a;        // ptr is a pointer to object a
std::cout << ptr->species;      // We use -> on pointers
ptr->greet();

std::cout << (*ptr).species;  // Another way to access a member
(*ptr).greet();  // Another way to call a method
```

> [!note]
> To access members of an **object** use `.`. To access members of a **pointer to an object** use `->` (which is equivalent to dereferencing and then using `.`).

# Operator overloading

C++ allows defining how operators (`+`, `++`, `==`, `<`, `<<`, etc.) behave when used with objects of a class or structure.

This is done by defining a function named `operator` followed by the operator:
```cpp
class Point {
public:
    int x;
    int y;

    Point(int x, int y) : x(x), y(y) {}

    Point operator+(const Point& other) {
        return Point(x + other.x, y + other.y);
    }
};
```

Now you can use `+` directly with Point objects:
```cpp
Point a(2, 3);
Point b(4, 5);

Point c = a + b;

std::cout << c.x << ", " << c.y;
// 6, 8
```

# Destructor

The **destructor** runs automatically when the object goes out of scope (or is deleted). It is used to free resources. It has `~` and the class name:

```cpp
class Resource {
public:
    Resource() { /* acquire the resource */ }
    ~Resource() { /* release the resource */ }
};
```

> [!note]
> The destructor is called automatically when leaving scope, even if there is an exception. This is the basis of [[programming/c++/Dynamic Memory and Smart Pointers|RAII]].

> [!warning]
> If the class has a destructor, it is important to think about the class's copy and move handling ([[programming/c++/Move Semantics#Rule of Three|Rule of Three]]). Otherwise there can be double frees or leaks.

# Separating declaration and definition

## Defining methods outside the class

Methods can be **declared** inside the class and **defined** later, outside of it, using `Class::method`. This works the same for `class` and `struct`:

```cpp
class Person {
	public:
	    std::string name;
	    Person(std::string n);  // Declaration only
	    void greet();           // Declaration only
};

// Definition outside the class
Person::Person(std::string n) : name(n) {}

void Person::greet() {
    std::cout << "Hello, I'm " << name << std::endl;
}
```

> [!note]
> A method can only be defined once, but can be declared as many times as you want.

## Different files

The normal way to organize a project is to separate **declarations** (what exists) from **definitions** (how it works) in different files. This way other files can use the class just by including the header, without including the implementation.

### Header file `.h`

Contains only the declarations, includes the headers the interface needs, and uses **include guards**:

```cpp
#ifndef PERSONA_H
#define PERSONA_H

class Person {
public:
    std::string name;
    Person(std::string n);  // Declaration only
    void greet();           // Declaration only
};

#endif
```

> [!warning]
> **Include guards** (`#ifndef` / `#define` / `#endif`) prevent the file from being included twice. Without them, the class would be declared repeatedly and cause a compilation error.
> `#pragma once` is also valid.

### Implementation file `.cpp`

Contains the definitions. Includes its own header to verify they match the declarations:

```cpp
#include "Person.h"

Person::Person(std::string n) : name(n) {}

void Person::greet() {
    std::cout << "Hello, I'm " << name << std::endl;
}
```

> [!important]
> Standard library headers are included with `<...>` and project headers with `"..."`.

### File using the class

Just needs to include the header to use the class:
```cpp
#include "Person.h"

int main() {
    Person p("Ana");
    p.greet();
    return 0;
}
```

### Compiling

You only need to pass the implementation files (`.cpp`) to the compiler.

```bash
g++ main.cpp Person.cpp -o program
```

> Next: [[programming/c++/Inheritance and Polymorphism|Inheritance and Polymorphism]]
