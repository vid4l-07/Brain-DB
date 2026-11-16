# Funciones

Se definen con `fn`, seguido del nombre, los parámetros entre paréntesis y el tipo de retorno tras una flecha (`->`) (obligatorio si difiere de `()`).

```rust
fn sum(a: i32, b: i32) -> i32 {
    a + b
}
```

> [!note]
> La última expresión del cuerpo de la función es el valor de retorno. Si usas `return` explícitamente, es para un retorno anticipado.

## Parámetros

Los parámetros **siempre** deben declarar su tipo:

```rust
fn print(text: &str, number: i32) {
    println!("{}: {}", text, number);
}
```

## Retorno

```rust
fn division(a: f64, b: f64) -> f64 {
    a / b  // Expresión (sin punto y coma)
}

fn no_return() {
    // Equivalente a devolver unit ()
}
```

> [!warning]
> Si pones `;` al final de la expresión de retorno, se convierte en una sentencia y la función devuelve `()` ([[programación/rust/Data Types#Empty tuple (unit)|unit]]). Asegúrate de que la última línea **no** termine en `;` si quieres devolver un valor.

# Closures

Las closures (funciones lambda) son funciones anónimas que pueden capturar variables de su entorno.

## Sintaxis básica

```rust
let sum_lambda = |a: i32, b: i32| -> i32 { a + b };
let result = sum_lambda(5, 10);
```

Los tipos de los parámetros son opcionales si el compilador puede inferirlos:

```rust
let sum = |a, b| a + b;
let result = sum(5, 10); // infiere i32
```

## Captura de variables

Las closures pueden capturar variables de tres formas:

### Por referencia inmutable (`&T`)

```rust
let name = "Ana";

let greet = || {
    println!("Hello {}", name);
};
greet();
```

### Por referencia mutable (`&mut T`)

```rust
let mut counter = 0;

let mut increment = || {
    counter += 1;
};
increment();
println!("{}", counter); // 1
```

### Por movimiento (`T`)

Con `move`, la closure toma la **propiedad** (ownership) de las variables que captura. La variable original deja de ser válida.

```rust
let name = String::from("Ana");

let print = move || {
    println!("{}", name);
};
print();
println!("{}", name); // ERROR: name se movió a la closure
```

> [!note]
> `move` es especialmente importante en [[Concurrency|concurrencia]], donde la closure puede ejecutarse después de que la función que la creó haya terminado.

## Diferencia entre closures y funciones

| Característica     | `fn`    | Closure                                     |
| ------------------ | ------- | ------------------------------------------- |
| Nombre             | Con nombre | Anónima                                  |
| Captura de entorno | No captura | Captura                                  |
| Inferencia de tipos | No     | Sí (parámetros y retorno)                   |
| Tamaño en memoria  | Fijo    | Variable (depende de lo que capture)        |

> [!tip]
> Las closures se usan con frecuencia como argumentos de métodos de iteradores (`.map()`, `.filter()`, `.fold()`, etc.) y en [[Concurrency#async fn|async]].

> Siguiente: [[programación/rust/Enums|Enums]]
