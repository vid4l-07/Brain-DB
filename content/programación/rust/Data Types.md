# Tipos de datos enteros

| Tipo  | Signo       | Rango              |
| ----- | ----------- | ------------------ |
| `i8`  | Con signo   | -128 a 127         |
| `u8`  | Sin signo   | 0 a 255            |
| `i16` | Con signo   | -32,768 a 32,767   |
| `u16` | Sin signo   | 0 a 65,535         |
| `i32` | Con signo   | -2³¹ a 2³¹-1       |
| `u32` | Sin signo   | 0 a 2³²-1          |
| `i64` | Con signo   | -2⁶³ a 2⁶³-1       |
| `u64` | Sin signo   | 0 a 2⁶⁴-1          |

El tipo `char` ocupa 4 bytes y se puede convertir a un entero con el método `as u32`.

```rust
let integer: i32 = 42;
let negative_integer: i32 = -42;
let unsigned_integer: u32 = 42;
let character: char = 'A';
```

## Conversión de tipos

```rust
let integer_to_float: f64 = integer as f64;            // entero → coma flotante
let char_to_integer: u32 = character as u32;           // char → entero
let integer_to_char: char = 65u8 as char;              // entero → char (puede fallar si no es un valor Unicode válido)
```

> [!warning]
> Convertir con `as` puede producir resultados inesperados si el valor de origen no cabe en el tipo de destino (por ejemplo, un `i32` grande convertido a `u8` se trunca silenciosamente).

# Tipos de datos de coma flotante

| Tipo  | Precisión           | Tamaño  |
|-------|---------------------|---------|
| `f32` | Precisión simple    | 32 bits |
| `f64` | Precisión doble     | 64 bits |

```rust
let float: f64 = 3.14;
let float_to_f32: f32 = float as f32;       // Conversión
let float_to_integer: i32 = float as i32;   // Conversión (trunca los decimales)
```

> [!note]
> `f64` es el tipo de coma flotante por defecto en Rust. Aunque `f32` ocupa menos memoria, `f64` es más rápido en CPUs de 64 bits y se prefiere por defecto.

# Tipos de datos booleanos

```rust
let boolean: bool = true;
let integer_to_boolean: bool = integer != 0; // Conversión a booleano
```

> [!note]
> No hay conversión implícita entre booleanos y otros tipos. Debes usar comparaciones explícitas como `!= 0` o `== 0`.

# Datos compuestos

## Tuplas

Agrupan valores de distintos tipos: `(T1, T2, T3, ...)`

```rust
let tuple: (i32, &str, char) = (42, "hello", 'A');

// Desestructuración en variables individuales
let (x, y, z) = tuple;
println!("{},{},{}", x, y, z);

// Desestructuración parcial, ignorando valores con _
let (x, _, _) = tuple;

// Acceso por índice (basado en 0)
let first_element: i32 = tuple.0;
let second_element: &str = tuple.1;
```

### Tupla vacía (unit)

```rust
let empty_tuple: () = (); // También conocida como "unit"
```

Es el tipo de retorno de las funciones que no devuelven ningún valor (equivalente a `void` en otros lenguajes).

### Comparación de tuplas

Se comparan elemento a elemento, de izquierda a derecha:

```rust
let tuple1: (i32, &str) = (1, "hello");
let tuple2: (i32, &str) = (2, "world");
let tuple3: (i32, &str) = (1, "hello");

let comparison1: bool = tuple1 == tuple2; // false
let comparison2: bool = tuple1 == tuple3; // true
```

## Arrays

Agrupan valores del mismo tipo con un tamaño **fijo** en tiempo de compilación: `[T; N]`

```rust
let array: [i32; 5] = [1, 2, 3, 4, 5];     // Array de enteros de tamaño 5
let repeated_array: [i32; 5] = [0; 5];       // Todos los valores inicializados a 0
let first_element_array: i32 = array[0];     // Acceso por índice
let second_element_array: i32 = array[1];
let empty_array: [i32; 0] = [];              // Array vacío
```

### Métodos de arrays

```rust
let array_length: usize = array.len();       // Longitud del array
let first: Option<&i32> = array.get(0);      // Acceso seguro → [[programming/rust/Option and Result|Option and Result]]
let is_empty: bool = array.is_empty();       // Comprueba si está vacío
let exists: bool = array.contains(&3);       // Contiene un elemento
```

> [!tip]
> `array.get(i)` devuelve `Option<&T>`, retornando `None` si el índice está fuera de los límites en lugar de provocar un panic. Consulta [[Option and Result|Option and Result]].

## Vectores

Agrupan valores del mismo tipo con un tamaño **dinámico**: `Vec<T>`

```rust
let mut vector: Vec<i32> = Vec::new();         // Vector vacío
let mut vector2: Vec<i32> = vec![1, 2, 3, 4];  // Vector inicializado con valores

vector.push(1); // Añade al final
vector.push(2);
vector.push(3);
```

```rust
let first: Option<&i32> = vector.get(0);     // Acceso seguro → [[programming/rust/Option and Result|Option and Result]]
let first_element: &i32 = &vector[0];        // Acceso directo (puede causar un panic)
```

> [!warning]
> Acceder con `vector[0]` puede provocar un panic si el índice está fuera de los límites. Usa `vector.get(0)` para un acceso seguro.

## Slices

Referencias a una parte de un array o un vector: `&[T]`

No son dueños de los datos, sino que referencian los datos de otro [[#Arrays|array]] o [[#Vectors|vector]].

```rust
let s: &[i32] = &array[1..4];            // Desde el índice 1 hasta el 4 (sin incluir 4)
let slice_vector: &[i32] = &vector[0..]; // Desde 0 hasta el último
let slice_integer: &[i32] = &array[..];  // Todo el array
```

> [!tip]
> Se recomienda usar slices como parámetros de funciones, de modo que la función acepte arrays, vectores o cualquier subsección de ellos.

```rust
fn sum(slice: &[i32]) -> i32 {
    slice.iter().sum() // suma todos los elementos
}
```

### Métodos de slices

Los **arrays** y los **vectores** también pueden usar estos métodos, ya que se convierten automáticamente en slices.

```rust
s.len()              // longitud
s.is_empty()         // ¿está vacío?
s.first()            // Option<&T> con el primer elemento, o None
s.last()             // Option<&T> con el último elemento, o None
s.get(i)             // Option<&T> con el elemento en el índice i, o None
s.contains(&x)       // ¿contiene un elemento?
s.sort()             // ordena en orden ascendente
s.reverse()          // invierte el orden
s.binary_search(&x)  // Ok(i) si se encuentra en el índice i, Err(i) si debería insertarse allí
```

### Iteradores

```rust
s.iter()             // iterador inmutable
s.iter_mut()         // iterador mutable
s.into_iter()        // consume la colección
```

## HashMap

Almacena pares **clave → valor** con acceso rápido basado en la clave.

```rust
use std::collections::HashMap;

let mut hashmap = HashMap::new();

hashmap.insert("Ana", 20);
hashmap.insert("Luis", 25);
hashmap.insert("Ana", 22); // sobrescribe el valor anterior
```

```rust
hashmap.remove("Ana");                           // Elimina el par clave-valor
hashmap.get("Ana");                              // Option<&V> → [[programming/rust/Option and Result|Option and Result]]
hashmap.entry("Ana").or_insert(20);              // Inserta solo si no existe
```

# Cadenas de texto

| Tipo     | Descripción        | Almacenamiento          |
| -------- | ------------------ | ----------------------- |
| `String` | Cadena mutable     | Heap (datos propios)    |
| `&str`   | Cadena inmutable   | Stack (referencia)      |

```rust
let s: &str = "Hello, world!";                                // Literal de cadena (&str)
let text_slice: &str = &text[0..5];                           // Slice de texto
let mutable_string: String = String::from("Hello, world!");   // String en el heap
```

## Conversión entre tipos

```rust
// &str → String
let to_string: String = text.to_string();   // Crea una copia en el heap
let to_string: String = String::from(text);   // Alternativa

// String → &str (coerción automática mediante Deref)
let to_str: &str = &mutable_string;
```

## Conversión hacia y desde otros tipos

```rust
let string_to_integer: i32 = string.parse().unwrap_or(0);  // Devuelve 0 si falla
let integer_to_string: String = integer.to_string();
```
`.parse()` devuelve un [[Option and Result#Result <T, E >|Result]].

## Métodos de cadenas de texto

Además de los métodos de los slices:

```rust
s.split(" ");              // divide por un separador
s.split_whitespace();      // divide por cualquier espacio en blanco
s.lines();                 // divide por saltos de línea
s.trim();                  // elimina espacios iniciales y finales

s.to_uppercase();          // mayúsculas
s.to_lowercase();          // minúsculas

s.chars();                 // iterador sobre caracteres (Unicode)
s.bytes();                 // iterador sobre bytes
s.char_indices();          // iterador de tuplas (índice, carácter)
```

> [!warning]
> Las cadenas de Rust son UTF-8. Acceder a un carácter por índice no siempre es O(1), ya que un carácter Unicode puede ocupar varios bytes. Usa `.chars()` para iterar sobre caracteres.

> Siguiente: [[Ownership and Borrowing|Ownership and Borrowing]]
