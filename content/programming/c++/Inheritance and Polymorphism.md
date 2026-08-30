# Inheritance

**Inheritance** allows a class (`derived`) to inherit the members and methods of another (`base`).

```cpp
class Animal {          // Base class
	public:
	    std::string species;
	    void eat() { std::cout << "eating..."; }
};

class Dog : public Animal { // Dog inherits from Animal
	public:
	    void bark() { std::cout << "Woof!"; }
};
```

```cpp
Dog d;
d.species = "canine";  // inherited member
d.eat();               // inherited method
d.bark();              // own method
```

# Inheritance types

The keyword between `:` and the base name controls the visibility of inherited members:

| Inheritance type | Effect on public members of the base            |
| ---------------- | ----------------------------------------------------- |
| `public`         | Remain public                                        |
| `protected`      | Become protected (only for derived classes)           |
| `private`        | Become private (not accessible)                      |

> [!note]
> `public` is the most common inheritance ("is-a"). `protected` allows access only from subclasses. `private` is rarely used (composition).

# protected

A `protected` member is accessible from the class itself and its derived classes, but not from outside:

```cpp
class Base {
protected:
    int data = 5;
};
class Derived : public Base {
public:
    void f() { std::cout << data; } // ok: derived class can access it
};
```

# Polymorphism with virtual functions

A **`virtual`** function allows the derived class version to be called through a base pointer/reference:

```cpp
class Animal {
	public:
	    virtual void sound() { std::cout << "generic"; } // virtual
};

class Dog : public Animal {
	public:
	    void sound() override { std::cout << "Woof!"; } // override indicates it replaces
};

class Cat : public Animal {
	public:
	    void sound() override { std::cout << "Meow!"; }
};
```

```cpp
Animal* ptr = new Dog();
ptr->sound(); // "Woof!" (calls Dog's version)
```

> [!warning]
> Without `virtual`, `ptr->sound()` would call `Animal`'s version even though the actual object is a `Dog`. `virtual` is what enables polymorphism.

# Abstract classes

A class with a **pure virtual function** (`= 0`) is **abstract**: it cannot be instantiated, it only serves as a base.

```cpp
class Shape {
	public:
	    virtual double area() const = 0; // pure virtual
};

class Circle : public Shape {
	public:
	    double area() const override { return 3.14 * r * r; }
	private:
	    double r = 1;
};
```

> [!note]
> An abstract class is C++'s way of defining an **interface** that multiple classes implement differently.


> Next: [[programming/c++/Move Semantics|Move Semantics]]
