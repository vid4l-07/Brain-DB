Lifetimes are the way Rust guarantees that references are always valid. Every reference has a lifetime that defines the scope during which it can be used.

# Why do they exist?

The compiler needs to make sure there are no **dangling references**: references that point to memory that has already been freed.

```rust
let reference;
{
    let data = String::from("Hello");
    reference = &data; // reference points to data
}
// reference dangles: data was freed but reference still exists
println!("{}", reference); // COMPILATION ERROR
```

> [!note]
> In most cases, lifetimes are inferred automatically. You only need to write them explicitly when the compiler cannot determine them.

# Syntax

Lifetimes are written with `'` followed by a name, generally `'a`, `'b`, `'c`, etc.

```rust
&i32        // Immutable reference without an explicit lifetime
&'a i32     // Immutable reference with lifetime 'a
&'a mut i32 // Mutable reference with lifetime 'a
```

# 'static

The `'static` lifetime indicates that the reference can live **for the entire program execution**:

```rust
// String literals have the 'static lifetime
let s: &'static str = "Hello, world";
```

> [!note]
> `'static` does not mean that the data lives forever, but that there are **no time restrictions** on its use. String literals are stored in the binary and are available during the entire execution.

> [!warning]
> Do not use `'static` just to make the code compile. If the compiler asks for a lifetime, it is generally because there is a real reference problem to solve.

# Lifetimes in functions

When a function returns a reference, the compiler needs to know which parameter the return lifetime depends on:

```rust
// ERROR
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}
```

## Explicit annotation

`'a` is used to tie the lifetime of the return to the parameters:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

> [!note]
> `'a` does not change how long the references live, it only tells the compiler that the return will live **at least** as long as the shortest parameter.

## Lifetime with a single parameter

If there is only one input reference, the compiler infers it automatically:

```rust
// This works
fn first_character(s: &str) -> &str {
    &s[..1]
}

// Equivalent with lifetime
fn first_character<'a>(s: &'a str) -> &'a str {
    &s[..1]
}
```

# Compiler rules

The compiler applies automatic rules to infer lifetimes. These rules are applied in **three steps**:

1. Each input reference receives its own lifetime.
2. If there is **exactly one** input reference, its lifetime is assigned to all output references.
3. If there are multiple input references but one of them is `&self` or `&mut self`, the `self` lifetime is assigned to all output references.

```rust
fn first(s: &str) -> &str { &s[..1] }
```
It becomes:
```rust
fn first<'a>(s: &'a str) -> &'a str { &s[..1] }
```

With two inputs, it has to be written explicitly:
```rust
// Error
fn longest(x: &str, y: &str) -> &str { ... }
// Ok
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str { ... }
```

With `&self`, the lifetime of `self` is assigned to the return value:
```rust
impl MyStruct {
    fn data(&self) -> &str { &self.name } // OK
}
```

> [!tip]
> In practice, you only need to annotate lifetimes when a function has **multiple input references** and returns a reference.

# Lifetimes in structs

When a [[programming/rust/Structs|struct]] contains references, it needs lifetime parameters to ensure that the references remain valid:

```rust
struct Extractor<'a> {
    line: &'a str, // The reference must live at least as long as the struct
}

let text = String::from("Hello, world");
let extractor = Extractor { line: &text };

println!("{}", extractor.line); // OK: text is still alive
```

> [!warning]
> If a struct contains references, it cannot implement `Copy` because the references could become dangling.

# Lifetimes in impl

`impl` blocks that contain references also need lifetime parameters:

```rust
impl<'a> Extractor<'a> {
    fn length(&self) -> usize {
        self.line.len()
    }
}
```

# Lifetime bounds

Additional constraints can be added with `+`:

```rust
// The reference must be 'a AND implement Display
fn show<'a>(s: &'a str) -> &'a str
where
    &'a str: std::fmt::Display,
{
    s
}
```

> [!note]
> In practice, lifetime bounds are more commonly used with generic traits, for example `T: 'a` to indicate that `T` contains references that live at least `'a`.

# Summary

| Concept               | Syntax    | Description                                            |
| --------------------- | --------- | ------------------------------------------------------ |
| Reference lifetime    | `&'a T`   | Reference that lives at least `'a`                     |
| Mutable lifetime      | `&'a mut T` | Mutable reference that lives at least `'a`          |
| Lifetime generic      | `<'a>`    | Declares a lifetime parameter                          |
| Static lifetime       | `'static` | Lives for the entire execution                         |
| Lifetime bounds       | `T: 'a`   | `T` contains references that live at least `'a`        |

> Next: [[programming/rust/Modules|Modules]]