Ownership is the central memory management system of Rust. The compiler automatically determines when to free memory based on the ownership rules.

# Ownership rules

1. Each value has **a single owner**.
2. When the owner goes out of scope, the value is **freed automatically**.
3. There can only be **one owner at a time**.

```rust
{
    let s1 = String::from("Hello"); // s1 is the owner of the value "Hello"
    // s1 is in scope
}
// s1 goes out of scope → the value is freed automatically
```

# Move semantics

When you assign a value to another variable or pass it to a function, the **ownership is transferred** (move). The original variable is no longer valid.

```rust
let s1 = String::from("Hello");
let s2 = s1; // s2 takes ownership, s1 is no longer valid

println!("{}", s1); // COMPILATION ERROR: s1 is no longer valid
```

> [!note]
> This applies to types with data on the heap (`String`, `Vec`, etc.). Types that live entirely on the stack (like integers, floats, booleans) are **copied** rather than moved.

# Clone

Creates a **deep copy** of the value, duplicating the data on the heap. Both variables are valid independently.

```rust
let s1 = String::from("Hello");
let s2 = s1.clone(); // Deep copy

println!("{}", s1); // OK: s1 is still valid
println!("{}", s2); // OK: s2 has its own copy
```

# Copy

Types that implement the `Copy` [[programming/rust/Traits|trait]] are **implicitly copied** when assigned or passed to a function. There is no move, both variables are valid.

```rust
let int1 = 5;
let int2 = int1; // int1 is copied, not moved

println!("{}", int1); // OK: int1 is still valid
```

> [!note]
> `Copy` types include: all integers (`i32`, `u64`, etc.), floats (`f32`, `f64`), booleans, characters (`char`) and tuples that only contain `Copy` types.

# Borrowing

Allows **accessing** a value without taking ownership. It is done with references (`&T`).

## Immutable references

```rust
let s1 = String::from("Hello");
let s2 = &s1; // s2 references s1, does not take ownership

println!("{}", s1); // OK: s1 is still valid
println!("{}", s2); // OK: can read the value
```

## Mutable references

```rust
let mut s3 = String::from("Hello");
let s4 = &mut s3;   // Mutable reference
s4.push_str(", world!"); // Modifies the value through the reference

println!("{}", s3); // OK: s3 now contains "Hello, world!"
```

> [!warning] Important
> You can only have **one mutable reference** or **several immutable references** at a time, but never both at the same time. This prevents race conditions at compile time.

> Next: [[programming/rust/Control Flow|Control Flow]]