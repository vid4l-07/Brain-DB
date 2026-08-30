Traits are a mechanism to define **shared behavior** between types. It is similar to **abstract classes** in other languages.

# Basic definition

```rust
trait Greet {
    fn greet(&self); // Method that must be implemented
}
```

# Implementation

```rust
impl Greet for Person {
    fn greet(&self) {
        println!("Hello, I'm {}", self.name);
    }
}

person.greet();
```

> [!note] *orphan rule*
> A trait can be implemented as long as:
> 1. The type is yours.
> 2. The trait is yours.
> 3. Both the type and the trait are yours.
>
> This allows adding behavior to types from external libraries:
> ```rust
> // custom trait for an external type
> impl Repeat for String {
>    fn repeat(&self) {
>        // implementation...
>    }
> }
> s.repeat();
>
> // external trait for a custom type
> struct Person;
> impl std::fmt::Display for Person {
>    // implementation...
> }
>
> // external trait for an external type
> impl std::fmt::Display for String {
>    // ERROR
> }
> ```

# Default values

A trait can provide default implementations that types can use or override:

```rust
trait Greet {
    fn greet(&self) {
        println!("Hello, I'm {}", self.name);
    }
}

impl Greet for Person {} // Uses the default implementation
```

> [!warning]
> The default implementation has access to `self.name`, but the compiler cannot verify that all types implementing the trait have a `name` field. If a type does not have it, you will get an error when implementing.

# Trait as parameter

Allows creating functions that accept **any type** that implements a trait:

```rust
fn show(s: &impl Greet) {
    s.greet();
}
```

## Alternative syntax (trait bound)

```rust
fn show<T: Greet>(s: &T) {
    s.greet();
}

// Multiple constraints
fn show_detailed<T: Greet + Debug>(s: &T) {
    println!("{:?}", s);
    s.greet();
}
```

# Trait as return type

Allows a function to return **any type** that implements a trait:

```rust
fn create(name: String, age: u32) -> impl Greet {
    Person { name, age }
}
```

> [!warning]
> When `impl Trait` is used as a return type, the function can only return **a single concrete type**. You cannot return `Person` in one case and `Animal` in another.
> ```rust
> fn create(b: bool) -> impl Greet {  // ERROR
>    if b {
>        Person
>    } else {
>        Dog
>    }
> }
> ```

To return any type that implements a trait you must use `Box<dyn>`. See [[programming/rust/Smart Pointers#Box <T >|Smart Pointers]].

```rust
fn create(b: bool) -> Box<dyn Greet> {
    if b {
        Box::new(Person)
    } else {
        Box::new(Dog)
    }
}
```

# Derived traits

They can be implemented automatically with `#[derive(...)]`. See [[programming/rust/Macros#Procedural macros#Derive macros|procedural macros]]:

```rust
#[derive(Debug)]
struct Alien {
    name: String,
    planet: String,
}
```

| Trait | Description | Usage example |
| ----|-------------|----------------|
| `Debug` | Printing with `{:?}` | `println!("{:?}", person)` |
| `Clone` | Copying with `.clone()` | `person.clone()` |
| `Copy` | Implicit copies | Assignment without move |
| `PartialEq` | `==` and `!=` comparison | `a == b` |
| `Eq` | Total equality | Extends `PartialEq` |
| `PartialOrd` | `<`, `>`, `<=`, `>=` comparison | `a < b` |
| `Ord` | Total order | For `sort()` |
| `Hash` | Hash computation | For `HashMap`, `HashSet` |
| `Default` | Default value | `Type::default()` |

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

let p1 = Point { x: 1.0, y: 2.0 };
let p2 = p1.clone();       // Clone
println!("{:?}", p1);      // Debug
let equal = p1 == p2;      // PartialEq
```

# Super traits

A trait can require that types implementing it also implement another trait:

```rust
trait SayName: Greet {
    fn name(&self);
}

// To implement SayName, the type MUST ALSO implement Greet
```

> [!tip]
> Super traits are useful when your trait depends on the behavior of another. For example, `Display: Debug` guarantees that every type that is displayable is also debuggable.

# Traits and standard types

Many standard library types implement common traits:

```rust
// Option and Result implement many traits
let opt: Option<i32> = Some(42);
println!("{:?}", opt);     // Debug
let opt2 = opt.clone();    // Clone
```

> [!note]
> [[programming/rust/Functions and Closures#Closures|Closures]] implement the `Fn`, `FnMut` and `FnOnce` traits depending on how they capture variables. This allows passing closures as arguments of generic functions.

> Next: [[programming/rust/Option and Result|Option and Result]]