La propiedad (ownership) es el sistema central de gestión de memoria de Rust. El compilador determina automáticamente cuándo liberar la memoria basándose en las reglas de ownership.

# Reglas de ownership

1. Cada valor tiene **un único propietario** (owner).
2. Cuando el propietario sale del ámbito, el valor se **libera automáticamente**.
3. Solo puede haber **un propietario a la vez**.

```rust
{
    let s1 = String::from("Hello"); // s1 es el propietario del valor "Hello"
    // s1 está en el ámbito
}
// s1 sale del ámbito → el valor se libera automáticamente
```

# Move semantics

Cuando asignas un valor a otra variable o lo pasas a una función, la **propiedad se transfiere** (move). La variable original deja de ser válida.

```rust
let s1 = String::from("Hello");
let s2 = s1; // s2 toma ownership, s1 ya no es válida

println!("{}", s1); // ERROR DE COMPILACIÓN: s1 ya no es válida
```

> [!note]
> Esto se aplica a tipos con datos en el heap (`String`, `Vec`, etc.). Los tipos que viven completamente en la pila (stack) (como enteros, floats, booleanos) se **copian** en lugar de moverse.

# Clone

Crea una **copia profunda** (deep copy) del valor, duplicando los datos en el heap. Ambas variables son válidas de forma independiente.

```rust
let s1 = String::from("Hello");
let s2 = s1.clone(); // Copia profunda

println!("{}", s1); // OK: s1 sigue siendo válida
println!("{}", s2); // OK: s2 tiene su propia copia
```

# Copy

Los tipos que implementan el [[Traits|trait]] `Copy` se **copian implícitamente** al asignarse o pasarse a una función. No hay movimiento, ambas variables son válidas.

```rust
let int1 = 5;
let int2 = int1; // int1 se copia, no se mueve

println!("{}", int1); // OK: int1 sigue siendo válida
```

> [!note]
> Los tipos `Copy` incluyen: todos los enteros (`i32`, `u64`, etc.), floats (`f32`, `f64`), booleanos, caracteres (`char`) y tuplas que solo contienen tipos `Copy`.

# Borrowing

Permite **acceder** a un valor sin tomar su propiedad. Se hace con referencias (`&T`).

## Referencias inmutables

```rust
let s1 = String::from("Hello");
let s2 = &s1; // s2 referencia a s1, no toma ownership

println!("{}", s1); // OK: s1 sigue siendo válida
println!("{}", s2); // OK: puede leer el valor
```

## Referencias mutables

```rust
let mut s3 = String::from("Hello");
let s4 = &mut s3;   // Referencia mutable
s4.push_str(", world!"); // Modifica el valor a través de la referencia

println!("{}", s3); // OK: s3 ahora contiene "Hello, world!"
```

> [!warning] Importante
> Solo puedes tener **una referencia mutable** o **varias referencias inmutables** a la vez, pero nunca ambas al mismo tiempo. Esto previene condiciones de carrera (race conditions) en tiempo de compilación.

> Siguiente: [[programación/rust/Control Flow|Control Flow]]
