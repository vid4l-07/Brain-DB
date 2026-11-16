Los **structs** son tipos de datos que agrupan valores relacionados bajo un único nombre. Cada valor se denomina **campo** y puede tener un tipo distinto.

# Definición y uso

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

Para editar los campos, la variable debe declararse como **mutable**:

```rust
let mut person_mutable: Person = Person {
    name: String::from("Ana"),
    age: 25,
};

person_mutable.age += 1;
```

# Sintaxis de actualización (update syntax)

Permite crear un struct copiando campos de otro, sobrescribiendo solo los que necesites:

```rust
let person2 = Person {
    name: String::from("Pedro"),
    ..person_mutable // Copia todos los campos excepto los especificados
};
```

> [!warning]
> Si `person_mutable` tiene campos que no implementan `Copy` (como `String`), los campos movidos ya no están disponibles en `person_mutable`. Solo se copian los campos que **no** se especifican explícitamente.

# Métodos

Los métodos se definen dentro de un bloque `impl`. El primer parámetro determina el tipo de acceso:

## Solo lectura: `&self`

```rust
impl Person {
    fn greet(&self) {
        println!("Hello, I'm {} and I'm {} years old", self.name, self.age);
    }
}

person.greet();
```

## Lectura y escritura: `&mut self`

```rust
impl Person {
    fn have_birthday(&mut self) {
        self.age += 1;
    }
}
```

## Consumir el objeto: `self`

```rust
impl Person {
    fn destroy(self) {
        // El objeto se destruye por ownership, no se puede usar después
        println!("Destroying {}...", self.name);
    }
}

person_mutable.destroy(); // person_mutable ya no es válido después
```

> [!note]
> Consulta [[Ownership and Borrowing|Ownership and Borrowing]] para entender por qué `self` consume el objeto y `&self`/`&mut self` lo toman prestado.

| Parámetro   | Tipo                | Descripción                                         |
| ----------- | ------------------- | --------------------------------------------------- |
| `self`      | Consumo             | Toma la propiedad, el objeto se destruye al final   |
| `&self`     | Préstamo inmutable  | Solo lectura                                        |
| `&mut self` | Préstamo mutable    | Lectura y escritura                                 |

# Constructores

## Función constructora

```rust
fn new_person(name: String, number: u32) -> Person {
    Person {
        name,
        age: number,
    }
}

let person: Person = new_person(String::from("Manolo"), 20);
```

> [!tip] Atajo
> Si el parámetro tiene el mismo nombre que el atributo:
> `name` == `name: name`.

## Función asociada (recomendada)

Las **funciones asociadas** no reciben `self` y se llaman con `NombreStruct::funcion()`. Son el patrón estándar para constructores en Rust.

```rust
impl Person {
    fn new(name: String, age: u32) -> Person {
        Person { name, age }
    }
}

let person: Person = Person::new(String::from("Luis"), 40);
```

> [!info]
> Las **funciones asociadas** son el equivalente de las **funciones estáticas** en otros lenguajes.

> Siguiente: [[Traits|Traits]]
