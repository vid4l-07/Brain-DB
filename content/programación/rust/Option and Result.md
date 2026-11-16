Son [[programación/rust/Enums|enums]] de la biblioteca estándar de Rust para manejar valores que pueden estar ausentes o ser errores. En Rust no existe `null`.

# Option\<T\>

Representa un valor **opcional**: contiene un valor de tipo `T` (`Some(T)`) o ninguno (`None`).

```rust
let option: Option<i32> = Some(42);   // Contiene un valor
let empty_option: Option<i32> = None; // No contiene valor
```

## Patrón con match

```rust
match option {
    Some(n) => println!("{}", n),
    None => println!("No value"),
}
```

Consulta [[programación/rust/Control Flow#Match|Control Flow]].

## Patrón con if let

```rust
if let Some(value) = option {
    println!("The value is: {}", value);
} else {
    println!("No value");
}
```

## Métodos específicos de Option

```rust
option.is_some();                          // true si contiene un valor
option.is_none();                          // true si no contiene valor
option.filter(|&x| x > 0);                // Devuelve Some(x) si cumple la condición, o None
```

## Ejemplo de función con Option

```rust
fn double(x: Option<i32>) -> Option<i32> {
    let n = x?; // Si x es None → devuelve None. Si es Some(n), n toma el valor
    Some(n * 2)
}
```

> [!note]
> El operador `?` dentro de una función que devuelve `Option` o `Result` propaga `None`/`Err` automáticamente.

# Result\<T, E\>

Representa el resultado de una operación que puede fallar: `Ok(T)` (éxito) o `Err(E)` (error).

```rust
let result: Result<i32, &str> = Ok(42);           // Éxito
let error_result: Result<i32, &str> = Err("Error"); // Error
```

## Patrón con match

```rust
match result {
    Ok(n) => println!("The value is: {}", n),
    Err(e) => println!("Error: {}", e),
}
```

## Patrón con if let

```rust
if let Ok(value) = result {
    println!("The value is: {}", value);
} else if let Err(error) = result {
    println!("Error: {}", error);
}
```

## Métodos específicos de Result

```rust
result.is_ok();                                            // true si es Ok
result.is_err();                                           // true si es Err
result.map_err(|e| format!("Error: {}", e));               // Transforma el Err, deja Ok intacto
```

## Ejemplo de función con Result

```rust
fn double(r: Result<i32, &'static str>) -> Result<i32, &'static str> {
    let n = r?; // Si r es Err(e) → devuelve Err(e). Si es Ok(n), n toma el valor
    Ok(n * 2)
}
```

# Métodos comunes de Option y Result

Ambos tipos comparten estos métodos:

```rust
// Obtener el valor
option.unwrap();                              // Devuelve el valor o hace panic
option.unwrap_or(0);                          // Devuelve el valor o el valor por defecto
option.unwrap_or_else(|| 0);                  // Devuelve el valor o el resultado de la función

// Transformar el valor
option.map(|x| x * 2);                       // Aplica una función al valor contenido
option.and_then(|x| Some(x * 2));             // Aplica una función que devuelve Option/Result

// Información
option.expect("Error: message");              // Igual que unwrap pero con un mensaje personalizado
option.as_ref();                              // Devuelve Option<&T> / Result<&T, &E> (toma prestado sin mover)
```

> [!warning]
> `unwrap()` es peligroso en código de producción porque provoca un `panic!` si el valor es `None`/`Err`. Es preferible usar `unwrap_or()`, `unwrap_or_else()` o pattern matching con `match`/`if let`.

> [!tip]
> `as_ref()` es útil cuando necesitas una referencia al valor sin consumir el Option/Result original.

> Siguiente: [[Error Handling|Error Handling]]
