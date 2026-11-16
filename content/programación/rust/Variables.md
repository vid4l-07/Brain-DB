# Mutabilidad

Las variables en Rust son **inmutables por defecto**. Para modificarlas, se debe usar la palabra clave `mut`.

```rust
let x = 5;       // Inmutable
let mut y = 10;  // Mutable
y += 5;          // OK
```

# Constantes

Son inmutables y **deben** inicializarse en tiempo de compilación. Se declaran con `const`.

```rust
const PI: f64 = 3.141592653589793;
const MAX: i32 = 100;
```

> [!note]
> A diferencia de `let`, las constantes no pueden omitir el tipo y su valor debe ser una constante en tiempo de compilación (no puede depender de un valor en tiempo de ejecución).

# Shadowing

Permite declarar una nueva variable con el **mismo nombre** que una existente, ocultando la variable original. A diferencia de `mut`, el shadowing crea una variable completamente nueva.

```rust
let x = 5;        // Primera variable x
let x = x + 1;    // Nueva variable x (oculta la anterior)
let x = x * 2;    // Otra variable x nueva
```

> [!tip]
> El shadowing es útil cuando necesitas transformar un valor y cambiar su tipo, algo que `mut` no permite:
> ```rust
> let spaces = "   ";          // &str
> let spaces = spaces.len();   // usize (same name, different type!)
> ```

> Siguiente: [[programación/rust/Data Types|Data Types]]
