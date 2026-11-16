Rust distingue entre errores **recuperables** e **irrecuperables**, obligando al programador a manejarlos explícitamente.

# Errores irrecuperables: `panic!`

Detiene el programa de inmediato. Se usa para situaciones que nunca deberían ocurrir.

```rust
panic!("Fatal error");
```

> [!warning]
> `panic!` termina el programa con un mensaje de error. En producción, úsalo solo para violaciones de invariantes (cosas que "nunca deberían ocurrir").

# Errores recuperables: `Result<T, E>`

Representa el resultado de una operación que puede fallar. Consulta [[Option and Result#Result<T, E>|Option and Result]].

```rust
use std::fs;

let result = fs::read_to_string("file.txt");

match result {
    Ok(contents) => println!("{}", contents),
    Err(e) => println!("Error: {}", e),
}
```

# El operador `?`

Propaga errores automáticamente. Si el resultado es `Err`, devuelve el error desde la función. Si es `Ok`, extrae el valor.

```rust
fn read_file(path: &str) -> Result<String, std::io::Error> {
    let contents = std::fs::read_to_string(path)?; // Devuelve el error si falla
    Ok(contents)
}
```

> [!note]
> El operador `?` solo se puede usar en funciones que devuelven `Result` u `Option`. Consulta [[Option and Result|Option and Result]]

> Siguiente: [[Smart Pointers|Smart Pointers]]
