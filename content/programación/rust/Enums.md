Los enums son tipos de datos que pueden tener un conjunto de **variantes**. Cada variante puede contener datos asociados.

# Enum básico

```rust
enum Color {
    Red,
    Green,
    Blue,
}

let color: Color = Color::Red;
```

# Enum con datos

Las variantes pueden contener datos de distintos tipos:

```rust
enum Outcome {
    Success(i32),
    Error(String),
}

let outcome: Outcome = Outcome::Success(42);
```

> [!note]
> Los enums estándar `Option` y `Result` de Rust son ejemplos de enums con datos. Consulta [[Option and Result|Option and Result]].

# Enum genérico

Puede funcionar con cualquier tipo:

```rust
enum Generic<T> {
    Value(T),
    None,
}
```

> [!note]
> `Option<T>` es esencialmente un `Generic` con las variantes `Some(T)` y `None`.

# Match con enums

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
> `match` con enums debe ser **exhaustivo**: se deben cubrir todas las variantes. Si olvidas una, el compilador dará un error.

# if let y while let

Alternativas más concisas a `match` cuando solo te interesa una variante:

```rust
// if let: ejecuta un bloque si la variante coincide
if let Color::Red = color {
    println!("The color is red");
} else {
    println!("The color is not red");
}

// while let: se ejecuta mientras la variante coincida
while let Color::Red = color {
    println!("The color is red");
    break; // rompe para evitar un bucle infinito
}
```

# Métodos en enums

Se pueden implementar métodos con `impl`.

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
> Los enums pueden implementar [[Traits|traits]], igual que los structs. De hecho, `Option` y `Result` implementan muchos traits como `Debug`, `Clone`, etc.

> Siguiente: [[Structs|Structs]]
