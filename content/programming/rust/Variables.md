# Mutability

Variables in Rust are **immutable by default**. To modify them, the `mut` keyword must be used.

```rust
let x = 5;       // Immutable
let mut y = 10;  // Mutable
y += 5;          // OK
```

# Constants

They are immutable and **must** be initialized at compile time. They are declared with `const`.

```rust
const PI: f64 = 3.141592653589793;
const MAX: i32 = 100;
```

> [!note]
> Unlike `let`, constants cannot omit the type and their value must be a compile-time constant (it cannot depend on a runtime value).

# Shadowing

Allows declaring a new variable with the **same name** as an existing one, hiding the original variable. Unlike `mut`, shadowing creates a completely new variable.

```rust
let x = 5;        // First variable x
let x = x + 1;    // New variable x (hides the previous one)
let x = x * 2;    // Another new variable x
```

> [!tip]
> Shadowing is useful when you need to transform a value and change its type, something `mut` does not allow:
> ```rust
> let spaces = "   ";          // &str
> let spaces = spaces.len();   // usize (same name, different type!)
> ```

> Next: [[programming/rust/Data Types|Data Types]]