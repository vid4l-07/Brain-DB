Los módulos organizan el código y evitan conflictos de nombres. Permiten agrupar funciones, structs, traits y otros módulos de forma lógica.

# Definición básica

```rust
mod math {
    pub fn sum(a: i32, b: i32) -> i32 {
        a + b
    }
}
```

> [!warning]
> Por defecto, todo en un módulo es **privado**. Debes usar `pub` para hacer visible una función, struct, trait o submódulo.

```rust
mod math {
    fn sum(a: i32, b: i32) -> i32 {  // Privada
        a + b
    }
}
math::sum(2, 3); // ERROR: función privada

mod math {
    pub fn sum(a: i32, b: i32) -> i32 {  // Pública
        a + b
    }
}
math::sum(2, 3); // OK
```

# Módulos en archivos separados

Cada archivo es un módulo. Para usarlo, se declara con `mod`:

## Estructura simple

```
src/
├── main.rs
└── math.rs
```

```rust
// math.rs
pub fn sum(a: i32, b: i32) -> i32 {
    a + b
}
```

```rust
// main.rs
mod math;
math::sum(2, 3);
```

# Módulos anidados

Los módulos pueden contener submódulos, formando una jerarquía:

## Estructura recomendada (usando `nombre_carpeta.rs`)

```txt
src/
├── main.rs
├── university.rs
└── university/
    ├── students.rs
    └── teachers.rs
```

```rust
// university/students.rs
pub fn list() {
    println!("List of students");
}
```

```rust
// university.rs
pub mod students;
pub mod teachers;
```

```rust
// main.rs
mod university;
university::students::list();
```

## Estructura alternativa (usando `mod.rs`)

```txt
src/
└── university/
    ├── mod.rs
    ├── students.rs
    └── teachers.rs
```

```rust
// university/mod.rs
pub mod students;
pub mod teachers;
```

> [!note]
> Ambas estructuras son válidas. La estructura con `university.rs` (sin `mod.rs`) es la más moderna y recomendada.

## Acceder al módulo padre

Dentro de un módulo hijo, usa `super::` para acceder al módulo padre:

```rust
mod university {
    pub fn name() {
        println!("Name")
    }

    pub mod students {
        pub fn list() {
            super::name(); // Llama a la función del módulo padre
            println!("List");
        }
    }
}

university::students::list();
```

# Uso de `use`

`use` permite importar elementos para usarlos sin escribir la ruta completa:

```rust
mod university;
use university::students;

students::list(); // Sin necesidad de escribir university::students::list
```

## Importar una función directamente

```rust
use university::students::list;
list(); // Sin prefijo
```

## Alias con `as`

Útil para evitar conflictos de nombres:

```rust
use university::students as unistudents;
unistudents::list();
```

## Importar todo (no recomendado)

```rust
use university::students::*;
list();
```

> [!warning]
> `use *` (importación glob) puede causar conflictos de nombres y dificulta rastrear de dónde proviene cada función. Evítalo en código de producción.

# `crate`

`crate` se refiere a la raíz del proyecto (donde está `main.rs` o `lib.rs`):

```rust
// Desde cualquier módulo
use crate::university::students;
```

> [!note]
> `crate::` equivale a una ruta absoluta desde la raíz del proyecto. Las rutas relativas usan `super::` (módulo padre) o `self::` (módulo actual).

> Siguiente: [[Macros|Macros]]
