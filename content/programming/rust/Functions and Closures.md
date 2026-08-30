# Functions

They are defined with `fn`, followed by the name, the parameters in parentheses, and the return type after an arrow (`->`) (required if it differs from `()`).

```rust
fn sum(a: i32, b: i32) -> i32 {
    a + b
}
```

> [!note]
> The last expression of the function body is the return value. If you use `return` explicitly, it is for an early return.

## Parameters

Parameters **always** must declare their type:

```rust
fn print(text: &str, number: i32) {
    println!("{}: {}", text, number);
}
```

## Return

```rust
fn division(a: f64, b: f64) -> f64 {
    a / b  // Expression (no semicolon)
}

fn no_return() {
    // Equivalent to returning the unit ()
}
```

> [!warning]
> If you put `;` at the end of the return expression, it becomes a statement and the function returns `()` ([[programming/rust/Data Types#Empty tuple (unit)|unit]]). Make sure the last line does **not** end in `;` if you want to return a value.

# Closures

Closures (lambda functions) are anonymous functions that can capture variables from their environment.

## Basic syntax

```rust
let sum_lambda = |a: i32, b: i32| -> i32 { a + b };
let result = sum_lambda(5, 10);
```

Parameter types are optional if the compiler can infer them:

```rust
let sum = |a, b| a + b;
let result = sum(5, 10); // infers i32
```

## Variable capture

Closures can capture variables in three ways:

### By immutable reference (`&T`)

```rust
let name = "Ana";

let greet = || {
    println!("Hello {}", name);
};
greet();
```

### By mutable reference (`&mut T`)

```rust
let mut counter = 0;

let mut increment = || {
    counter += 1;
};
increment();
println!("{}", counter); // 1
```

### By move (`T`)

With `move`, the closure takes **ownership** of the variables it captures. The original variable is no longer valid.

```rust
let name = String::from("Ana");

let print = move || {
    println!("{}", name);
};
print();
println!("{}", name); // ERROR: name was moved into the closure
```

> [!note]
> `move` is especially important in [[programming/rust/Concurrency|concurrency]], where the closure may execute after the function that created it has finished.

## Difference between closures and functions

| Feature           | `fn`    | Closure                            |
| ----------------- | ------- | ---------------------------------- |
| Name              | Named   | Anonymous                          |
| Environment capture | Does not capture | Captures                     |
| Type inference    | No      | Yes (parameters and return)        |
| Size in memory    | Fixed   | Variable (depends on what is captured) |

> [!tip]
> Closures are frequently used as arguments of iterator methods (`.map()`, `.filter()`, `.fold()`, etc.) and in [[programming/rust/Concurrency#async fn|async]].

> Next: [[programming/rust/Enums|Enums]]