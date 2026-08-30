Macros generate code during compilation. They allow creating custom syntax that expands into standard Rust code.

# Declarative macros (`macro_rules!`)

They work through **patterns and substitutions**: the compiler looks for a pattern and generates the specified code in that position.

### Basic syntax

```rust
macro_rules! macro_name {
    (pattern) => {
        code
    };
}
```

### Simple example

```rust
macro_rules! greet {
    () => {
        println!("Hello!");
    };
}
greet!(); // Expands to: println!("Hello!");
```

> [!note]
> Macros are invoked with `!` after the name: `name!()` or `name![]`. Without the `!` it is a normal function call.

## Parameters and fragment types

Parameters are captured with `$name:fragment`:

| Fragment | Description            | Example                                 |
| --------- | ---------------------- | --------------------------------------- |
| `expr`    | Expression             | `5`, `5+3`, `x*10`                      |
| `ident`   | Identifier (name)      | variable, function, module              |
| `ty`      | Type                   | `i32`, `String`, `&str`                 |
| `pat`     | Pattern (match, if let)| `Some(x)`, `Ok(x)`, `None`              |
| `stmt`    | Complete statement     | `let x = 5`                             |
| `item`    | Language item          | function, struct, enum, trait           |
| `block`   | Code block             | `{ println!("Hello"); }`                |
| `literal` | Literal                | `5`, `"hello"`, `'c'` (not an expression) |
| `path`    | Path                   | `std::io`                               |
| `tt`      | Any token              | any piece of code                       |

Example with `expr`:
```rust
macro_rules! square {
    ($x:expr) => {
        $x * $x
    };
}
let result = square!(5); // Expands to: 5 * 5
```

## Multiple rules

A macro can have multiple patterns. The compiler uses the first one that matches:

```rust
macro_rules! greet {
    () => {
        println!("Hello");
    };

    ($name:expr) => {
        println!("Hello {}", $name);
    };
}

greet!();          // First pattern
greet!("Ana");     // Second pattern
```

## Creating functions

```rust
macro_rules! create_function {
    ($name:ident) => {
        fn $name() {
            println!("Function created");
        }
    };
}

create_function!(hello); // Generates: fn hello() { println!("Function created"); }
hello();
```

## Creating variables

```rust
macro_rules! variable {
    ($name:ident) => {
        let $name = 10;
    };
}

variable!(x); // Generates: let x = 10;
```

## Capturing types

```rust
macro_rules! create_vector {
    ($type:ty) => {
        Vec::<$type>::new()
    };
}

let v = create_vector!(i32); // Generates: Vec::<i32>::new()
```

## Capturing blocks

```rust
macro_rules! execute {
    ($b:block) => {
        $b
    };
}

execute!({
    println!("Hello");
});
```

# Procedural macros

They are implemented in a separate crate. Unlike declarative macros, the macro **knows the structure of the code** it is processing and can modify it.

## Derive macros

They are used with `#[derive(...)]` and generate automatic trait implementations:

```rust
#[derive(Clone)]
struct Person {
    name: String,
}

// Automatically generates:
// impl Clone for Person {
//     fn clone(&self) -> Self { ... }
// }
```

See [[programming/rust/Traits#Derived traits|derived traits]] for the list of standard derivable traits.

## Attribute macros

They modify functions, structs, modules or impls:

```rust
#[my_macro]
fn hello() {
    println!("Hello");
}

// The macro receives the function and transforms it, for example into:
// fn hello() {
//     println!("Entering");
//     println!("Hello");
//     println!("Leaving");
// }
```

> [!tip]
> Attribute macros are the basis of frameworks like Tokio (`#[tokio::main]`), Rocket (`#[get("/")]`), and serde (`#[derive(Serialize)]`). See [[programming/rust/Concurrency#Runtime|Concurrency]] for an example with Tokio.

> Next: [[programming/rust/Concurrency|Concurrency]]