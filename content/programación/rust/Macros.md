Las macros generan código durante la compilación. Permiten crear sintaxis personalizada que se expande a código Rust estándar.

# Macros declarativas (`macro_rules!`)

Funcionan mediante **patrones y sustituciones**: el compilador busca un patrón y genera el código especificado en esa posición.

### Sintaxis básica

```rust
macro_rules! macro_name {
    (pattern) => {
        code
    };
}
```

### Ejemplo simple

```rust
macro_rules! greet {
    () => {
        println!("Hello!");
    };
}
greet!(); // Se expande a: println!("Hello!");
```

> [!note]
> Las macros se invocan con `!` después del nombre: `name!()` o `name![]`. Sin el `!` sería una llamada a función normal.

## Parámetros y tipos de fragmentos

Los parámetros se capturan con `$name:fragment`:

| Fragmento | Descripción             | Ejemplo                                 |
| --------- | ----------------------- | --------------------------------------- |
| `expr`    | Expresión               | `5`, `5+3`, `x*10`                      |
| `ident`   | Identificador (nombre)  | variable, función, módulo               |
| `ty`      | Tipo                    | `i32`, `String`, `&str`                 |
| `pat`     | Patrón (match, if let)  | `Some(x)`, `Ok(x)`, `None`              |
| `stmt`    | Sentencia completa      | `let x = 5`                             |
| `item`    | Elemento del lenguaje   | función, struct, enum, trait            |
| `block`   | Bloque de código        | `{ println!("Hello"); }`                |
| `literal` | Literal                 | `5`, `"hello"`, `'c'` (no una expresión) |
| `path`    | Ruta                    | `std::io`                               |
| `tt`      | Cualquier token         | cualquier fragmento de código           |

Ejemplo con `expr`:
```rust
macro_rules! square {
    ($x:expr) => {
        $x * $x
    };
}
let result = square!(5); // Se expande a: 5 * 5
```

## Múltiples reglas

Una macro puede tener varios patrones. El compilador usa el primero que coincida:

```rust
macro_rules! greet {
    () => {
        println!("Hello");
    };

    ($name:expr) => {
        println!("Hello {}", $name);
    };
}

greet!();          // Primer patrón
greet!("Ana");     // Segundo patrón
```

## Crear funciones

```rust
macro_rules! create_function {
    ($name:ident) => {
        fn $name() {
            println!("Function created");
        }
    };
}

create_function!(hello); // Genera: fn hello() { println!("Function created"); }
hello();
```

## Crear variables

```rust
macro_rules! variable {
    ($name:ident) => {
        let $name = 10;
    };
}

variable!(x); // Genera: let x = 10;
```

## Capturar tipos

```rust
macro_rules! create_vector {
    ($type:ty) => {
        Vec::<$type>::new()
    };
}

let v = create_vector!(i32); // Genera: Vec::<i32>::new()
```

## Capturar bloques

```rust
macro_rules! execute {
    ($b:block) => {
        $b
    };
}

execute!({
    println!("Hello");
});
```

# Macros procedurales

Se implementan en un crate separado. A diferencia de las macros declarativas, la macro **conoce la estructura del código** que está procesando y puede modificarla.

## Macros derive

Se usan con `#[derive(...)]` y generan implementaciones automáticas de traits:

```rust
#[derive(Clone)]
struct Person {
    name: String,
}

// Genera automáticamente:
// impl Clone for Person {
//     fn clone(&self) -> Self { ... }
// }
```

Consulta [[Traits#Derived traits|traits derivados]] para ver la lista de traits derivables estándar.

## Macros de atributo

Modifican funciones, structs, módulos o impls:

```rust
#[my_macro]
fn hello() {
    println!("Hello");
}

// La macro recibe la función y la transforma, por ejemplo en:
// fn hello() {
//     println!("Entering");
//     println!("Hello");
//     println!("Leaving");
// }
```

> [!tip]
> Las macros de atributo son la base de frameworks como Tokio (`#[tokio::main]`), Rocket (`#[get("/")]`) y serde (`#[derive(Serialize)]`). Consulta [[Concurrency#Runtime|Concurrencia]] para ver un ejemplo con Tokio.

> Siguiente: [[Concurrency|Concurrency]]
