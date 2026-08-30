Rust distinguishes between **recoverable** and **unrecoverable** errors, forcing the programmer to handle them explicitly.

# Unrecoverable errors: `panic!`

Stops the program immediately. It is used for situations that should never happen.

```rust
panic!("Fatal error");
```

> [!warning]
> `panic!` terminates the program with an error message. In production, use it only for invariant violations (things that "should never happen").

# Recoverable errors: `Result<T, E>`

Represents the result of an operation that can fail. See [[programming/rust/Option and Result#Result<T, E>|Option and Result]].

```rust
use std::fs;

let result = fs::read_to_string("file.txt");

match result {
    Ok(contents) => println!("{}", contents),
    Err(e) => println!("Error: {}", e),
}
```

# The `?` operator

Automatically propagates errors. If the result is `Err`, it returns the error from the function. If it is `Ok`, it extracts the value.

```rust
fn read_file(path: &str) -> Result<String, std::io::Error> {
    let contents = std::fs::read_to_string(path)?; // Returns the error if it fails
    Ok(contents)
}
```

> [!note]
> The `?` operator can only be used in functions that return `Result` or `Option`. See [[programming/rust/Option and Result|Option and Result]]

> Next: [[programming/rust/Smart Pointers|Smart Pointers]]