# Stack vs Heap

- **Stack**: automatic and fast memory, freed when leaving scope. Local variables and parameters.
- **Heap**: dynamic memory, slower, manually allocated and freed. Useful for large or variable-size data.

# new and delete

Manual heap allocation with `new` and `delete`:

```cpp
int* p = new int(5);   // allocate an int on the heap
std::cout << *p;       // 5
delete p;              // free the memory (mandatory!)

int* arr = new int[10]; // dynamic array
delete[] arr;           // free the array (with brackets)
```

> [!warning]
> Forgetting `delete` causes **memory leaks**. Freeing twice or freeing memory not allocated with `new` is undefined behavior. That's why `new`/`delete` is almost never used directly in modern C++.

# Smart pointers

**Smart pointers** are objects that manage memory automatically: they free resources when no longer used, preventing leaks. They are defined in `#include <memory>`.

## std::unique_ptr

**Sole owner** of the memory. Cannot be copied, only moved.

```cpp
std::unique_ptr<int> p = std::make_unique<int>(42);
std::cout << *p; // 42
// Automatically freed when leaving scope
```

## std::shared_ptr

Multiple pointers **share** ownership. Memory is freed when the last `shared_ptr` is destroyed (reference counting).

```cpp
std::shared_ptr<int> a = std::make_shared<int>(7);
std::shared_ptr<int> b = a; // a and b share the same int
std::cout << a.use_count(); // 2 (number of owners)
```

> [!note]
> `shared_ptr` uses **reference counting**: memory is freed when the last `shared_ptr` using it is destroyed. This allows sharing the same data between multiple parts of the code without duplicating it.

## std::weak_ptr

**Weak** reference that does not count as an owner. Used to break cycles between `shared_ptr` (two objects referencing each other would never be freed).

```cpp
std::weak_ptr<int> w = a; // does not increment use_count
if (auto sp = w.lock()) { // lock() gives a shared_ptr if it still exists
    // use sp
}
```

> [!warning]
> If two objects reference each other with `shared_ptr` (cycle), they are never freed. Break the cycle using `weak_ptr` on at least one side.

# RAII

**RAII** (Resource Acquisition Is Initialization) is the pattern where **resources** (memory, files, mutexes) are acquired in an object's constructor and released in the destructor.

```cpp
class File {
    FILE* f;
public:
    File(const char* name) { f = fopen(name, "r"); }
    ~File() { fclose(f); } // automatically closed when leaving scope
};
```

> [!note]
> RAII guarantees resource release even with exceptions or early `return`: the destructor always runs when leaving scope. It is the foundation of smart pointers and many STL types (like `std::string` or `std::ofstream`).

> Next: [[programming/c++/Objects|Objects]]
