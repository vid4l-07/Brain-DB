**Structs** are data types that group related values under a single name. Each value is called a **field** and can have a different type.

# Definition and use

```rust
struct Person {
    name: String,
    age: u32,
}

let person: Person = Person {
    name: String::from("Juan"),
    age: 30,
};

println!("Name: {}, Age: {}", person.name, person.age);
```

To edit the fields, the variable must be declared as **mutable**:

```rust
let mut person_mutable: Person = Person {
    name: String::from("Ana"),
    age: 25,
};

person_mutable.age += 1;
```

# Update syntax

Allows creating a struct by copying fields from another, overwriting only the ones you need:

```rust
let person2 = Person {
    name: String::from("Pedro"),
    ..person_mutable // Copies all fields except the specified ones
};
```

> [!warning]
> If `person_mutable` has fields that do not implement `Copy` (like `String`), the moved fields are no longer available in `person_mutable`. Only fields that are **not** explicitly specified are copied.

# Methods

Methods are defined inside an `impl` block. The first parameter determines the type of access:

## Read-only: `&self`

```rust
impl Person {
    fn greet(&self) {
        println!("Hello, I'm {} and I'm {} years old", self.name, self.age);
    }
}

person.greet();
```

## Read and write: `&mut self`

```rust
impl Person {
    fn have_birthday(&mut self) {
        self.age += 1;
    }
}
```

## Consuming the object: `self`

```rust
impl Person {
    fn destroy(self) {
        // The object is destroyed by ownership, it cannot be used afterward
        println!("Destroying {}...", self.name);
    }
}

person_mutable.destroy(); // person_mutable is no longer valid afterward
```

> [!note]
> See [[programming/rust/Ownership and Borrowing|Ownership and Borrowing]] to understand why `self` consumes the object and `&self`/`&mut self` borrow it.

| Parameter   | Type                | Description                                      |
| ----------- | ------------------- | ------------------------------------------------ |
| `self`      | Consume             | Takes ownership, the object is destroyed at the end |
| `&self`     | Immutable borrow    | Read-only                                        |
| `&mut self` | Mutable borrow      | Read and write                                   |

# Constructors

## Constructor function

```rust
fn new_person(name: String, number: u32) -> Person {
    Person {
        name,
        age: number,
    }
}

let person: Person = new_person(String::from("Manolo"), 20);
```

> [!tip] Shorthand
> If the parameter has the same name as the attribute:
> `name` == `name: name`.

## Associated function (recommended)

**Associated functions** do not receive `self` and are called with `StructName::function()`. They are the standard pattern for constructors in Rust.

```rust
impl Person {
    fn new(name: String, age: u32) -> Person {
        Person { name, age }
    }
}

let person: Person = Person::new(String::from("Luis"), 40);
```

> [!info]
> **Associated functions** are the equivalent of **static functions** in other languages.

> Next: [[programming/rust/Traits|Traits]]