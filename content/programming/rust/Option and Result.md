They are [[programming/rust/Enums|enums]] from Rust's standard library for handling values that may be absent or be errors. There is no `null` in Rust.

# Option\<T\>

Represents an **optional** value: it contains a value of type `T` (`Some(T)`) or none (`None`).

```rust
let option: Option<i32> = Some(42);   // Contains a value
let empty_option: Option<i32> = None; // Contains no value
```

## Pattern with match

```rust
match option {
    Some(n) => println!("{}", n),
    None => println!("No value"),
}
```

See [[programming/rust/Control Flow#Match|Control Flow]].

## Pattern with if let

```rust
if let Some(value) = option {
    println!("The value is: {}", value);
} else {
    println!("No value");
}
```

## Methods specific to Option

```rust
option.is_some();                          // true if it contains a value
option.is_none();                          // true if it contains no value
option.filter(|&x| x > 0);                // Returns Some(x) if it satisfies the condition, or None
```

## Example function with Option

```rust
fn double(x: Option<i32>) -> Option<i32> {
    let n = x?; // If x is None → return None. If it is Some(n), n takes the value
    Some(n * 2)
}
```

> [!note]
> The `?` operator inside a function that returns `Option` or `Result` propagates `None`/`Err` automatically.

# Result\<T, E\>

Represents the result of an operation that can fail: `Ok(T)` (success) or `Err(E)` (error).

```rust
let result: Result<i32, &str> = Ok(42);           // Success
let error_result: Result<i32, &str> = Err("Error"); // Error
```

## Pattern with match

```rust
match result {
    Ok(n) => println!("The value is: {}", n),
    Err(e) => println!("Error: {}", e),
}
```

## Pattern with if let

```rust
if let Ok(value) = result {
    println!("The value is: {}", value);
} else if let Err(error) = result {
    println!("Error: {}", error);
}
```

## Methods specific to Result

```rust
result.is_ok();                                            // true if it is Ok
result.is_err();                                           // true if it is Err
result.map_err(|e| format!("Error: {}", e));               // Transforms the Err, leaves Ok untouched
```

## Example function with Result

```rust
fn double(r: Result<i32, &'static str>) -> Result<i32, &'static str> {
    let n = r?; // If r is Err(e) → return Err(e). If it is Ok(n), n takes the value
    Ok(n * 2)
}
```

# Common methods of Option and Result

Both types share these methods:

```rust
// Getting the value
option.unwrap();                              // Returns the value or panics
option.unwrap_or(0);                          // Returns the value or the default value
option.unwrap_or_else(|| 0);                  // Returns the value or the result of the function

// Transforming the value
option.map(|x| x * 2);                       // Applies a function to the contained value
option.and_then(|x| Some(x * 2));             // Applies a function that returns Option/Result

// Information
option.expect("Error: message");              // Same as unwrap but with a custom message
option.as_ref();                              // Returns Option<&T> / Result<&T, &E> (borrows without moving)
```

> [!warning]
> `unwrap()` is dangerous in production code because it causes a `panic!` if the value is `None`/`Err`. Prefer `unwrap_or()`, `unwrap_or_else()`, or pattern matching with `match`/`if let`.

> [!tip]
> `as_ref()` is useful when you need a reference to the value without consuming the original Option/Result.

> Next: [[programming/rust/Error Handling|Error Handling]]