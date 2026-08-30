Enums are data types that can have a set of **variants**. Each variant can contain associated data.

# Basic enum

```rust
enum Color {
    Red,
    Green,
    Blue,
}

let color: Color = Color::Red;
```

# Enum with data

Variants can contain data of different types:

```rust
enum Outcome {
    Success(i32),
    Error(String),
}

let outcome: Outcome = Outcome::Success(42);
```

> [!note]
> Rust's standard `Option` and `Result` enums are examples of enums with data. See [[programming/rust/Option and Result|Option and Result]].

# Generic enum

It can work with any type:

```rust
enum Generic<T> {
    Value(T),
    None,
}
```

> [!note]
> `Option<T>` is essentially a `Generic` with variants `Some(T)` and `None`.

# Match with enums

```rust
match color {
    Color::Red => println!("The color is red"),
    Color::Green => println!("The color is green"),
    Color::Blue => println!("The color is blue"),
}

match outcome {
    Outcome::Success(value) => println!("The outcome is: {}", value),
    Outcome::Error(message) => println!("Error: {}", message),
}
```

> [!warning]
> `match` with enums must be **exhaustive**: all variants must be covered. If you forget one, the compiler will give an error.

# if let and while let

More concise alternatives to `match` when you only care about one variant:

```rust
// if let: runs a block if the variant matches
if let Color::Red = color {
    println!("The color is red");
} else {
    println!("The color is not red");
}

// while let: runs while the variant matches
while let Color::Red = color {
    println!("The color is red");
    break; // breaks to avoid an infinite loop
}
```

# Methods in enums

Methods can be implemented with `impl`.

```rust
impl Color {
    fn name(&self) -> &str {
        match self {
            Color::Red => "Red",
            Color::Green => "Green",
            Color::Blue => "Blue",
        }
    }
}

let color_str: &str = color.name();
```

> [!note]
> Enums can implement [[programming/rust/Traits|traits]], just like structs. In fact, `Option` and `Result` implement many traits such as `Debug`, `Clone`, etc.

> Next: [[programming/rust/Structs|Structs]]