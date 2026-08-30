Smart pointers are data structures that act like pointers but with additional behavior managed automatically. Unlike regular references, they own the data they point to and take care of freeing the memory when they go out of scope.

# Box\<T\>

`Box<T>` allocates data on the **heap** instead of the stack. It is the most basic smart pointer and is useful for:
- Data whose size is unknown at compile time.
- Creating recursive data structures.

```rust
let x: Box<i32> = Box::new(5);
println!("{}", x); // Automatically dereferenced
```

> [!note]
> `Box<T>` implements the `Deref` [[programming/rust/Traits|trait]], allowing it to be used like a normal reference.

## Use cases

### Dynamically sized types

The compiler does not know the size of a recursive enumeration without `Box`:

```rust
// ERROR: infinite size
enum List {
    Node(i32, List),
    End,
}

// OK: Box has a fixed size (a pointer)
enum List {
    Node(i32, Box<List>),
    End,
}
```

### Avoiding expensive copies

```rust
let big_data: Box<Vec<i32>> = Box::new(vec![1, 2, 3, 4, 5]);
let reference = &big_data; // Passes a reference, does not copy the vector
```

### Trait objects

`Box<dyn Trait>` allows returning different types that implement the same trait. See [[programming/rust/Traits#Trait as return type|Traits as return type]].

```rust
fn create(b: bool) -> Box<dyn Greet> {
    if b {
        Box::new(Person)
    } else {
        Box::new(Dog)
    }
}
```

> [!warning]
> `Box<T>` frees the memory automatically when it goes out of scope. There is no manual `free` like in C/C++.

# Rc\<T\>

`Rc<T>` (Reference Counted) allows **multiple owners** of the same data on the heap. It counts how many references exist and only frees the data when the last reference is destroyed.

```rust
use std::rc::Rc;

let a = Rc::new(vec![1, 2, 3]);
let b = Rc::clone(&a); // Increments the reference count
let c = Rc::clone(&a); // Increments again

println!("Count: {}", Rc::strong_count(&a)); // 3
```

> [!note]
> `Rc::clone` does not create a copy of the data, it only increments the reference counter. It is very cheap.

```rust
use std::rc::Rc;

let list = Rc::new(vec![1, 2, 3]);
let another_list = list.clone(); // Same data, two owners

println!("{:?}", list);      // OK
println!("{:?}", another_list); // OK
```

> [!warning]
> `Rc<T>` only works in **a single thread**. It cannot be shared between threads. Use `Arc<T>` for [[programming/rust/Concurrency|concurrency]].

> [!warning]
> `Rc<T>` is **immutable** by default. You cannot modify the inner data directly. For that, use `RefCell<T>`.

# RefCell\<T\>

`RefCell<T>` implements **interior mutability**: it allows modifying the data even when the reference is immutable. The borrowing check is performed at **runtime** instead of at compile time.

```rust
use std::cell::RefCell;

let data = RefCell::new(vec![1, 2, 3]);

// Immutable borrow
{
    let read = data.borrow();
    println!("{:?}", read);
}

// Mutable borrow
data.borrow_mut().push(4);
println!("{:?}", data.borrow()); // [1, 2, 3, 4]
```

> [!warning]
> If you try to `borrow()` while there is an active `borrow_mut()` (or vice versa), the program will **panic** at runtime.

> [!tip]
> Combining `Rc` and `RefCell` allows having **multiple owners** that can **modify** data:
>
> ```rust
> use std::rc::Rc;
> use std::cell::RefCell;
>
> let shared = Rc::new(RefCell::new(vec![1, 2, 3]));
>
> let owner1 = Rc::clone(&shared);
> let owner2 = Rc::clone(&shared);
>
> owner1.borrow_mut().push(4);
> owner2.borrow_mut().push(5);
>
> println!("{:?}", shared.borrow()); // [1, 2, 3, 4, 5]
> ```

# Arc\<T\>

`Arc<T>` (Atomically Reference Counted) is the **thread-safe** version of `Rc<T>`. It allows sharing data between threads with atomic reference counting.

```rust
use std::sync::Arc;
use std::thread;

let data = Arc::new(vec![1, 2, 3]);

let thread1 = Arc::clone(&data);
let thread2 = Arc::clone(&data);

thread::spawn(move || {
    println!("Thread 1: {:?}", thread1);
});

thread::spawn(move || {
    println!("Thread 2: {:?}", thread2);
});
```

> [!note]
> `Arc<T>` has a small overhead compared to `Rc<T>` because of the atomic operations. Only use it when you need to share data between threads.

> [!warning]
> `Arc<T>` is **immutable** by default, just like `Rc<T>`. To modify shared data between threads combine it with `Mutex<T>`:

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let data = Arc::new(Mutex::new(vec![1, 2, 3]));

let thread = Arc::clone(&data);
thread::spawn(move || {
    let mut list = thread.lock().unwrap();
    list.push(4);
}).join().unwrap();

println!("{:?}", data.lock().unwrap()); // [1, 2, 3, 4]
```

# Summary

| Smart Pointer | Owners   | Thread-safe | Mutability         |
|---------------|----------|-------------|--------------------|
| `Box<T>`      | One      | Yes         | Mutable            |
| `Rc<T>`       | Multiple | No          | Immutable          |
| `RefCell<T>`  | One      | No          | Interior mutability |
| `Arc<T>`      | Multiple | Yes         | Immutable          |

> [!tip]
> - Use `Box<T>` by default to allocate on the heap.
> - Use `Rc<T>` when you need multiple owners in a single thread.
> - Use `RefCell<T>` when you need to modify data from immutable references.
> - Use `Arc<T>` when you share data between threads.

> Next: [[programming/rust/Lifetimes|Lifetimes]]