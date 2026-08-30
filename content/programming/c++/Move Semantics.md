# Lvalues and rvalues

An expression is an **lvalue** (left value) if it has a **memory address** and can be assigned. An **rvalue** is a temporary value without a stable address.

```cpp
int x = 5;   // x is an lvalue (has an address)
5            // is an rvalue (temporary)
x + 2        // is an rvalue (temporary result)
```

> [!note]
> An lvalue can appear on the left side of an assignment; an rvalue cannot: `5 = x;` is invalid.

# Rvalue references (&&)

A `&&` reference (rvalue reference) binds to temporary values (rvalues). It allows distinguishing whether we are dealing with a temporary object that can be "stolen" or moved:

```cpp
int&& rref = 5;       // rref binds to the temporary 5
```

# Move semantics

"Moving" an object transfers its resources (like a `std::string`'s buffer) instead of copying them. It is cheaper than copying.

```cpp
std::string a = "Hello very long world";
std::string b = std::move(a); // moves a's content to b, without copying
// a is left in a valid but "empty/unspecified" state
```

> [!warning]
> After `std::move`, the source object is left in a valid but **unspecified** state (usually empty). Don't use it unless you reassign or destroy it.

# std::move

`std::move(x)` converts `x` to an rvalue, allowing the move constructor to be used instead of the copy constructor.

```cpp
std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = std::move(v1); // v2 steals v1's buffer
```

# Move constructor and move assignment

```cpp
class Buffer {
	    int* data;
	public:
	    Buffer(Buffer&& other) noexcept   // move constructor
	        : data(other.data) {
	        other.data = nullptr;        // leave the source without the resource
	    }
	
	    Buffer& operator=(Buffer&& other) noexcept { // move assignment
	        if (this != &other) {
	            delete[] data;         // free own resource
	            data = other.data;
	            other.data = nullptr;
	        }
	        return *this;
	    }
};
```

> [!note]
> C++ move is **optional and explicit**: it only happens if you use `std::move` or if the object is a temporary rvalue. 

# Rule of Three / Five / Zero

If a class manages resources manually, it must define a coherent set of special methods.

## Rule of Three

If you define the **destructor**, **copy constructor**, or **copy assignment**, you usually need all three:

- Destructor
- Copy constructor
- Copy assignment

## Rule of Five

With move semantics (C++11), two more are added:

- Move constructor
- Move assignment

> [!warning]
> If you define a destructor but not copy or move, the compiler generates default versions that can cause double frees or leaks. Correctly defining only one of the five usually requires defining them all.

## Rule of Zero

If the class does **not** manage resources manually (it uses STL types like `std::string` or `std::vector`), define none: let the compiler generate everything by default. It is the simplest and safest.

```cpp
class Person {
    std::string name; // the STL manages its resources
    int age;
    // No special method is defined: Rule of Zero
};
```

> [!tip]
> In general, prefer the **Rule of Zero**: use smart pointers and STL containers so you don't have to write destructors or copy constructors by hand.

> Next: [[programming/c++/Templates|Templates]]