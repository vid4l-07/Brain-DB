# Conditionals

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
> Conditions must be `bool`. There is no implicit conversion from integers to booleans as in other languages.

## if as an expression

In Rust, `if` is an expression and returns a value:

```rust
let approved = if number > 4 { true } else { false };
```

# Match

`match` is a control pattern that allows branching the code according to a value. It must cover **all** possible cases.

```rust
match number {
    x if x < 0 => println!("Negative"),       // Guard
    0 => println!("Zero"),                    // Exact literal
    1..=4 => println!("Between 1 and 4"),     // Inclusive range
    _ => println!("Other"),                   // Wildcard
}
```

> [!note]
> The range `1..=4` includes 4. If you want to exclude the upper bound use `1..4`.

## Match as an expression

```rust
let approved = match number {
    x if x < 5 => false,
    5..=10 => true,
    _ => false,
};
```

## Special patterns in match

```rust
// Multiple values
match color {
    Color::Red | Color::Green => println!("Red or green"),
    _ => println!("Another color"),
}

// Destructuring
match point {
    (0, 0) => println!("Origin"),
    (x, 0) => println!("X axis: {}", x),
    (0, y) => println!("Y axis: {}", y),
    (x, y) => println!("Point: {}, {}", x, y),
}

// Binding with @ (stores the data in a variable (n in this case))
match age {
    n @ 18..=65 => println!("Age {} in working range", n),
    _ => println!("Out of range"),
}
```

> [!tip]
> `match` is heavily used with [[programming/rust/Option and Result|Option and Result]] to elegantly handle missing values or errors:
> ```rust
> match option {
>     Some(value) => println!("Has value: {}", value),
>     None => println!("No value"),
> }
> ```

# Loops

## while

```rust
let mut number = 5;
while number < 10 {
    println!("The number is less than 10");
    number += 1;
}
```

## loop

Equivalent to `while true`. It can be used to create infinite loops with explicit control.

```rust
loop {
    println!("Infinite loop");
    break; // breaks the loop
}
```

### loop with return value

`loop` can return a value with `break`:

```rust
let result = loop {
    let number = 5;
    if number > 4 {
        break number * 2; // breaks and returns a value
    }
};
```

## for

Loop that iterates over a range, collection or iterator.

```rust
// Range (0 to 10, including 10)
for i in 0..=10 {
    println!("The number is: {}", i);
}
```

Allows iterating over [[programming/rust/Data Types#Composite data|composite types]].
```rust
// Reference to the array (avoids the copy)
for value in &array {
    println!("The value is: {}", value);
}

// With enumeration (index + value)
for (i, value) in array.iter().enumerate() {
    println!("Index: {}, Value: {}", i, value);
}

// Iterating over a HashMap
for (name, age) in &hashmap {
    println!("{} {}", name, age);
}

// Mutable reference (modifies the elements)
for element in &mut vector {
    *element += 1; // dereference to modify
}
```

> [!tip]
> `for` is preferable to `while` or `loop` when you know how many iterations you need. The compiler can optimize it better.

> Next: [[programming/rust/Functions and Closures|Functions and Closures]]