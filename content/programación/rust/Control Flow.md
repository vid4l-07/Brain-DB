# Condicionales

## if / else

```rust
let number = 5;

if number < 0 && number > -10 {
    println!("The number is negative");
} else if number == 0 {
    println!("The number is zero");
} else {
    println!("The number is positive");
}
```

> [!note]
> Las condiciones deben ser de tipo `bool`. No hay conversión implícita de enteros a booleanos como en otros lenguajes.

## if como expresión

En Rust, `if` es una expresión y devuelve un valor:

```rust
let approved = if number > 4 { true } else { false };
```

# Match

`match` es un patrón de control que permite ramificar el código según un valor. Debe cubrir **todos** los casos posibles.

```rust
match number {
    x if x < 0 => println!("Negative"),       // Guardiaia
    0 => println!("Zero"),                    // Literal exacto
    1..=4 => println!("Between 1 and 4"),     // Rango inclusivo
    _ => println!("Other"),                   // Comodín
}
```

> [!note]
> El rango `1..=4` incluye el 4. Si quieres excluir el límite superior, usa `1..4`.

## Match como expresión

```rust
let approved = match number {
    x if x < 5 => false,
    5..=10 => true,
    _ => false,
};
```

## Patrones especiales en match

```rust
// Múltiples valores
match color {
    Color::Red | Color::Green => println!("Red or green"),
    _ => println!("Another color"),
}

// Desestructuración
match point {
    (0, 0) => println!("Origin"),
    (x, 0) => println!("X axis: {}", x),
    (0, y) => println!("Y axis: {}", y),
    (x, y) => println!("Point: {}, {}", x, y),
}

// Enlace con @ (almacena el dato en una variable (n en este caso))
match age {
    n @ 18..=65 => println!("Age {} in working range", n),
    _ => println!("Out of range"),
}
```

> [!tip]
> `match` se usa mucho con [[Option and Result|Option and Result]] para manejar de forma elegante valores ausentes o errores:
> ```rust
> match option {
>     Some(value) => println!("Has value: {}", value),
>     None => println!("No value"),
> }
> ```

# Bucles

## while

```rust
let mut number = 5;
while number < 10 {
    println!("The number is less than 10");
    number += 1;
}
```

## loop

Equivalente a `while true`. Se puede usar para crear bucles infinitos con control explícito.

```rust
loop {
    println!("Infinite loop");
    break; // sale del bucle
}
```

### loop con valor de retorno

`loop` puede devolver un valor con `break`:

```rust
let result = loop {
    let number = 5;
    if number > 4 {
        break number * 2; // rompe y devuelve un valor
    }
};
```

## for

Bucle que itera sobre un rango, una colección o un iterador.

```rust
// Rango (de 0 a 10, incluido 10)
for i in 0..=10 {
    println!("The number is: {}", i);
}
```

Permite iterar sobre [[programación/rust/Data Types#Composite data|tipos compuestos]].
```rust
// Referencia al array (evita la copia)
for value in &array {
    println!("The value is: {}", value);
}

// Con enumeración (índice + valor)
for (i, value) in array.iter().enumerate() {
    println!("Index: {}, Value: {}", i, value);
}

// Iterando sobre un HashMap
for (name, age) in &hashmap {
    println!("{} {}", name, age);
}

// Referencia mutable (modifica los elementos)
for element in &mut vector {
    *element += 1; // desreferenciar para modificar
}
```

> [!tip]
> `for` es preferible a `while` o `loop` cuando se sabe cuántas iteraciones se necesitan. El compilador puede optimizarlo mejor.

> Siguiente: [[Functions and Closures|Functions and Closures]]
