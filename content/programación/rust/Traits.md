Los traits son un mecanismo para definir **comportamiento compartido** entre tipos. Son similares a las **clases abstractas** de otros lenguajes.

# Definición básica

```rust
trait Greet {
    fn greet(&self); // Método que debe implementarse
}
```

# Implementación

```rust
impl Greet for Person {
    fn greet(&self) {
        println!("Hello, I'm {}", self.name);
    }
}

person.greet();
```

> [!note] *orphan rule*
> Un trait se puede implementar siempre que:
> 1. El tipo sea tuyo.
> 2. El trait sea tuyo.
> 3. Tanto el tipo como el trait sean tuyos.
>
> Esto permite añadir comportamiento a tipos de bibliotecas externas:
> ```rust
> // custom trait for an external type
> impl Repeat for String {
>    fn repeat(&self) {
>        // implementation...
>    }
> }
> s.repeat();
>
> // external trait for a custom type
> struct Person;
> impl std::fmt::Display for Person {
>    // implementation...
> }
>
> // external trait for an external type
> impl std::fmt::Display for String {
>    // ERROR
> }
> ```

# Valores por defecto

Un trait puede proporcionar implementaciones por defecto que los tipos pueden usar o sobrescribir:

```rust
trait Greet {
    fn greet(&self) {
        println!("Hello, I'm {}", self.name);
    }
}

impl Greet for Person {} // Usa la implementación por defecto
```

> [!warning]
> La implementación por defecto tiene acceso a `self.name`, pero el compilador no puede verificar que todos los tipos que implementan el trait tengan un campo `name`. Si un tipo no lo tiene, obtendrás un error al implementar.

# Trait como parámetro

Permite crear funciones que aceptan **cualquier tipo** que implemente un trait:

```rust
fn show(s: &impl Greet) {
    s.greet();
}
```

## Sintaxis alternativa (trait bound)

```rust
fn show<T: Greet>(s: &T) {
    s.greet();
}

// Múltiples restricciones
fn show_detailed<T: Greet + Debug>(s: &T) {
    println!("{:?}", s);
    s.greet();
}
```

# Trait como tipo de retorno

Permite que una función devuelva **cualquier tipo** que implemente un trait:

```rust
fn create(name: String, age: u32) -> impl Greet {
    Person { name, age }
}
```

> [!warning]
> Cuando se usa `impl Trait` como tipo de retorno, la función solo puede devolver **un único tipo concreto**. No puedes devolver `Person` en un caso y `Animal` en otro.
> ```rust
> fn create(b: bool) -> impl Greet {  // ERROR
>    if b {
>        Person
>    } else {
>        Dog
>    }
> }
> ```

Para devolver cualquier tipo que implemente un trait debes usar `Box<dyn>`. Consulta [[Smart Pointers#Box <T >|Smart Pointers]].

```rust
fn create(b: bool) -> Box<dyn Greet> {
    if b {
        Box::new(Person)
    } else {
        Box::new(Dog)
    }
}
```

# Traits derivados

Se pueden implementar automáticamente con `#[derive(...)]`. Consulta [[Macros#Procedural macros#Derive macros|macros procedurales]]:

```rust
#[derive(Debug)]
struct Alien {
    name: String,
    planet: String,
}
```

| Trait | Descripción | Ejemplo de uso |
| ----|-------------|----------------|
| `Debug` | Impresión con `{:?}` | `println!("{:?}", person)` |
| `Clone` | Copia con `.clone()` | `person.clone()` |
| `Copy` | Copias implícitas | Asignación sin move |
| `PartialEq` | Comparación `==` y `!=` | `a == b` |
| `Eq` | Igualdad total | Extiende `PartialEq` |
| `PartialOrd` | Comparación `<`, `>`, `<=`, `>=` | `a < b` |
| `Ord` | Orden total | Para `sort()` |
| `Hash` | Cálculo de hash | Para `HashMap`, `HashSet` |
| `Default` | Valor por defecto | `Tipo::default()` |

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

let p1 = Point { x: 1.0, y: 2.0 };
let p2 = p1.clone();       // Clone
println!("{:?}", p1);      // Debug
let equal = p1 == p2;      // PartialEq
```

# Supertraits

Un trait puede requerir que los tipos que lo implementan también implementen otro trait:

```rust
trait SayName: Greet {
    fn name(&self);
}

// Para implementar SayName, el tipo TAMBIÉN DEBE implementar Greet
```

> [!tip]
> Los supertraits son útiles cuando tu trait depende del comportamiento de otro. Por ejemplo, `Display: Debug` garantiza que todo tipo que se puede mostrar también se puede depurar.

# Traits y tipos estándar

Muchos tipos de la biblioteca estándar implementan traits comunes:

```rust
// Option y Result implementan muchos traits
let opt: Option<i32> = Some(42);
println!("{:?}", opt);     // Debug
let opt2 = opt.clone();    // Clone
```

> [!note]
> Las [[Functions and Closures#Closures|closures]] implementan los traits `Fn`, `FnMut` y `FnOnce` dependiendo de cómo capturan las variables. Esto permite pasar closures como argumentos de funciones genéricas.

> Siguiente: [[Option and Result|Option and Result]]
