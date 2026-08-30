Modules organize code and avoid name conflicts. They allow grouping functions, structs, traits and other modules in a logical way.

# Basic definition

```rust
mod math {
    pub fn sum(a: i32, b: i32) -> i32 {
        a + b
    }
}
```

> [!warning]
> By default, everything in a module is **private**. You must use `pub` to make a function, struct, trait or submodule visible.

```rust
mod math {
    fn sum(a: i32, b: i32) -> i32 {  // Private
        a + b
    }
}
math::sum(2, 3); // ERROR: private function

mod math {
    pub fn sum(a: i32, b: i32) -> i32 {  // Public
        a + b
    }
}
math::sum(2, 3); // OK
```

# Modules in separate files

Each file is a module. To use it, it is declared with `mod`:

## Simple structure

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

# Nested modules

Modules can contain submodules, forming a hierarchy:

## Recommended structure (using `folder_name.rs`)

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

## Alternative structure (using `mod.rs`)

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
> Both structures are valid. The structure with `university.rs` (without `mod.rs`) is the most modern and recommended.

## Accessing the parent module

Inside a child module, use `super::` to access the parent module:

```rust
mod university {
    pub fn name() {
        println!("Name")
    }

    pub mod students {
        pub fn list() {
            super::name(); // Calls the function of the parent module
            println!("List");
        }
    }
}

university::students::list();
```

# Using `use`

`use` allows importing items to use them without writing the full path:

```rust
mod university;
use university::students;

students::list(); // Without the need to write university::students::list
```

## Importing a function directly

```rust
use university::students::list;
list(); // Without prefix
```

## Alias with `as`

Useful for avoiding name conflicts:

```rust
use university::students as unistudents;
unistudents::list();
```

## Importing everything (not recommended)

```rust
use university::students::*;
list();
```

> [!warning]
> `use *` (glob import) can cause name conflicts and makes it hard to trace where each function comes from. Avoid it in production code.

# `crate`

`crate` refers to the root of the project (where `main.rs` or `lib.rs` is):

```rust
// From any module
use crate::university::students;
```

> [!note]
> `crate::` is equivalent to an absolute path from the root of the project. Relative paths use `super::` (parent module) or `self::` (current module).

> Next: [[programming/rust/Macros|Macros]]