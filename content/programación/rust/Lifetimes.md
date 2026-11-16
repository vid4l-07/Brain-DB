Los lifetimes son la forma que tiene Rust de garantizar que las referencias sean siempre válidas. Cada referencia tiene un lifetime que define el ámbito durante el cual puede utilizarse.

# ¿Por qué existen?

El compilador necesita asegurarse de que no haya **referencias colgantes** (dangling references): referencias que apuntan a memoria que ya ha sido liberada.

```rust
let reference;
{
    let data = String::from("Hello");
    reference = &data; // la referencia apunta a los datos
}
// la referencia queda colgando: los datos se liberaron pero la referencia sigue existiendo
println!("{}", reference); // ERROR DE COMPILACIÓN
```

> [!note]
> En la mayoría de los casos, los lifetimes se infieren automáticamente. Solo necesitas escribirlos explícitamente cuando el compilador no puede determinarlos.

# Sintaxis

Los lifetimes se escriben con `'` seguido de un nombre, generalmente `'a`, `'b`, `'c`, etc.

```rust
&i32        // Referencia inmutable sin un lifetime explícito
&'a i32     // Referencia inmutable con lifetime 'a
&'a mut i32 // Referencia mutable con lifetime 'a
```

# 'static

El lifetime `'static` indica que la referencia puede vivir **durante toda la ejecución del programa**:

```rust
// Los literales de cadena tienen el lifetime 'static
let s: &'static str = "Hello, world";
```

> [!note]
> `'static` no significa que los datos vivan para siempre, sino que **no hay restricciones de tiempo** en su uso. Los literales de cadena se almacenan en el binario y están disponibles durante toda la ejecución.

> [!warning]
> No uses `'static` solo para que el código compile. Si el compilador pide un lifetime, generalmente es porque hay un problema real de referencias que resolver.

# Lifetimes en funciones

Cuando una función devuelve una referencia, el compilador necesita saber de qué parámetro depende el lifetime del retorno:

```rust
// ERROR
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}
```

## Anotación explícita

Se usa `'a` para vincular el lifetime del retorno con los parámetros:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

> [!note]
> `'a` no cambia cuánto viven las referencias, solo le indica al compilador que el retorno vivirá **al menos** tanto como el parámetro más corto.

## Lifetime con un único parámetro

Si solo hay una referencia de entrada, el compilador la infiere automáticamente:

```rust
// Esto funciona
fn first_character(s: &str) -> &str {
    &s[..1]
}

// Equivalente con lifetime
fn first_character<'a>(s: &'a str) -> &'a str {
    &s[..1]
}
```

# Reglas del compilador

El compilador aplica reglas automáticas para inferir los lifetimes. Estas reglas se aplican en **tres pasos**:

1. Cada referencia de entrada recibe su propio lifetime.
2. Si hay **exactamente una** referencia de entrada, su lifetime se asigna a todas las referencias de salida.
3. Si hay múltiples referencias de entrada pero una de ellas es `&self` o `&mut self`, el lifetime de `self` se asigna a todas las referencias de salida.

```rust
fn first(s: &str) -> &str { &s[..1] }
```
Se convierte en:
```rust
fn first<'a>(s: &'a str) -> &'a str { &s[..1] }
```

Con dos entradas, hay que escribirlo explícitamente:
```rust
// Error
fn longest(x: &str, y: &str) -> &str { ... }
// Ok
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str { ... }
```

Con `&self`, el lifetime de `self` se asigna al valor de retorno:
```rust
impl MyStruct {
    fn data(&self) -> &str { &self.name } // OK
}
```

> [!tip]
> En la práctica, solo necesitas anotar lifetimes cuando una función tiene **múltiples referencias de entrada** y devuelve una referencia.

# Lifetimes en structs

Cuando un [[Structs|struct]] contiene referencias, necesita parámetros de lifetime para asegurar que las referencias sigan siendo válidas:

```rust
struct Extractor<'a> {
    line: &'a str, // La referencia debe vivir al menos tanto como el struct
}

let text = String::from("Hello, world");
let extractor = Extractor { line: &text };

println!("{}", extractor.line); // OK: text sigue vivo
```

> [!warning]
> Si un struct contiene referencias, no puede implementar `Copy` porque las referencias podrían quedar colgando.

# Lifetimes en impl

Los bloques `impl` que contienen referencias también necesitan parámetros de lifetime:

```rust
impl<'a> Extractor<'a> {
    fn length(&self) -> usize {
        self.line.len()
    }
}
```

# Restricciones de lifetime (lifetime bounds)

Se pueden añadir restricciones adicionales con `+`:

```rust
// La referencia debe ser 'a Y implementar Display
fn show<'a>(s: &'a str) -> &'a str
where
    &'a str: std::fmt::Display,
{
    s
}
```

> [!note]
> En la práctica, las restricciones de lifetime se usan más comúnmente con traits genéricos, por ejemplo `T: 'a` para indicar que `T` contiene referencias que viven al menos `'a`.

# Resumen

| Concepto                  | Sintaxis      | Descripción                                              |
| ------------------------- | ------------- | -------------------------------------------------------- |
| Lifetime de referencia    | `&'a T`       | Referencia que vive al menos `'a`                        |
| Lifetime mutable          | `&'a mut T`   | Referencia mutable que vive al menos `'a`                |
| Genérico de lifetime      | `<'a>`        | Declara un parámetro de lifetime                         |
| Lifetime estático         | `'static`     | Vive durante toda la ejecución                           |
| Restricciones de lifetime | `T: 'a`       | `T` contiene referencias que viven al menos `'a`         |

> Siguiente: [[Modules|Modules]]
