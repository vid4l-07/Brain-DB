# Integer data types

| Type  | Sign     | Range            |
| ----- | -------- | ---------------- |
| `i8`  | Signed   | -128 to 127      |
| `u8`  | Unsigned | 0 to 255         |
| `i16` | Signed   | -32,768 to 32,767 |
| `u16` | Unsigned | 0 to 65,535       |
| `i32` | Signed   | -2³¹ to 2³¹-1     |
| `u32` | Unsigned | 0 to 2³²-1        |
| `i64` | Signed   | -2⁶³ to 2⁶³-1     |
| `u64` | Unsigned | 0 to 2⁶⁴-1        |

The `char` type occupies 4 bytes and can be converted to an integer with the `as u32` method.

```rust
let integer: i32 = 42;
let negative_integer: i32 = -42;
let unsigned_integer: u32 = 42;
let character: char = 'A';
```

## Type conversion

```rust
let integer_to_float: f64 = integer as f64;            // integer → float
let char_to_integer: u32 = character as u32;           // char → integer
let integer_to_char: char = 65u8 as char;              // integer → char (can fail if is not a valid Unicode value)
```

> [!warning]
> Casting with `as` can produce unexpected results if the source value does not fit in the destination type (for example, a large `i32` cast to `u8` is silently truncated).

# Floating point data types

| Type | Precision        | Size |
|------|------------------|------|
| `f32` | Single precision | 32 bits |
| `f64` | Double precision | 64 bits |

```rust
let float: f64 = 3.14;
let float_to_f32: f32 = float as f32;       // Conversion
let float_to_integer: i32 = float as i32;   // Conversion (truncates decimals)
```

> [!note]
> `f64` is the default floating point type in Rust. Although `f32` takes less memory, `f64` is faster on 64-bit CPUs and is preferred by default.

# Boolean data types

```rust
let boolean: bool = true;
let integer_to_boolean: bool = integer != 0; // Conversion to boolean
```

> [!note]
> There is no implicit conversion between booleans and other types. You must use explicit comparisons like `!= 0` or `== 0`.

# Composite data

## Tuples

Group values of different types: `(T1, T2, T3, ...)`

```rust
let tuple: (i32, &str, char) = (42, "hello", 'A');

// Destructuring into individual variables
let (x, y, z) = tuple;
println!("{},{},{}", x, y, z);

// Partial destructuring, ignoring values with _
let (x, _, _) = tuple;

// Index access (0-based)
let first_element: i32 = tuple.0;
let second_element: &str = tuple.1;
```

### Empty tuple (unit)

```rust
let empty_tuple: () = (); // Also known as the "unit"
```

It is the return type of functions that return no value (equivalent to `void` in other languages).

### Tuple comparison

They are compared element by element, from left to right:

```rust
let tuple1: (i32, &str) = (1, "hello");
let tuple2: (i32, &str) = (2, "world");
let tuple3: (i32, &str) = (1, "hello");

let comparison1: bool = tuple1 == tuple2; // false
let comparison2: bool = tuple1 == tuple3; // true
```

## Arrays

Group values of the same type with a **fixed** size at compile time: `[T; N]`

```rust
let array: [i32; 5] = [1, 2, 3, 4, 5];     // Array of integers of size 5
let repeated_array: [i32; 5] = [0; 5];       // All values initialized to 0
let first_element_array: i32 = array[0];     // Index access
let second_element_array: i32 = array[1];
let empty_array: [i32; 0] = [];              // Empty array
```

### Array methods

```rust
let array_length: usize = array.len();       // Array length
let first: Option<&i32> = array.get(0);      // Safe access → [[programming/rust/Option and Result|Option and Result]]
let is_empty: bool = array.is_empty();       // Checks if it is empty
let exists: bool = array.contains(&3);       // Contains an element
```

> [!tip]
> `array.get(i)` returns `Option<&T>`, returning `None` if the index is out of bounds instead of causing a panic. See [[programming/rust/Option and Result|Option and Result]].

## Vectors

Group values of the same type with a **dynamic** size: `Vec<T>`

```rust
let mut vector: Vec<i32> = Vec::new();         // Empty vector
let mut vector2: Vec<i32> = vec![1, 2, 3, 4];  // Vector initialized with values

vector.push(1); // Adds to the end
vector.push(2);
vector.push(3);
```

```rust
let first: Option<&i32> = vector.get(0);     // Safe access → [[programming/rust/Option and Result|Option and Result]]
let first_element: &i32 = &vector[0];        // Direct access (can cause a panic)
```

> [!warning]
> Accessing with `vector[0]` can cause a panic if the index is out of bounds. Use `vector.get(0)` for safe access.

## Slices

References to a part of an array or vector: `&[T]`

They do not own data, but rather reference the data of another [[#Arrays|array]] or [[#Vectors|vector]].

```rust
let s: &[i32] = &array[1..4];            // From index 1 to index 4 (excluding 4)
let slice_vector: &[i32] = &vector[0..]; // From 0 to the last one
let slice_integer: &[i32] = &array[..];  // The whole array
```

> [!tip]
> It is recommended to use slices as function parameters, so the function accepts arrays, vectors, or any subsection of them.

```rust
fn sum(slice: &[i32]) -> i32 {
    slice.iter().sum() // sums all elements
}
```

### Slice methods

**Arrays** and **vectors** can also use these methods, since they are automatically converted into slices.

```rust
s.len()              // length
s.is_empty()         // is it empty?
s.first()            // Option<&T> with the first element, or None
s.last()             // Option<&T> with the last element, or None
s.get(i)             // Option<&T> with the element at index i, or None
s.contains(&x)       // contains an element?
s.sort()             // sorts in ascending order
s.reverse()          // reverses the order
s.binary_search(&x)  // Ok(i) if found at index i, Err(i) if it should be inserted there
```

### Iterators

```rust
s.iter()             // immutable iterator
s.iter_mut()         // mutable iterator
s.into_iter()        // consumes the collection
```

## HashMap

Stores **key → value** pairs with fast key-based access.

```rust
use std::collections::HashMap;

let mut hashmap = HashMap::new();

hashmap.insert("Ana", 20);
hashmap.insert("Luis", 25);
hashmap.insert("Ana", 22); // overwrites the previous value
```

```rust
hashmap.remove("Ana");                           // Removes the key-value pair
hashmap.get("Ana");                              // Option<&V> → [[programming/rust/Option and Result|Option and Result]]
hashmap.entry("Ana").or_insert(20);              // Inserts only if it does not exist
```

# Text strings

| Type     | Description      | Storage                 |
| -------- | ---------------- | ----------------------- |
| `String` | Mutable string   | Heap (owned data)       |
| `&str`   | Immutable string | Stack (reference)       |

```rust
let s: &str = "Hello, world!";                                // String literal (&str)
let text_slice: &str = &text[0..5];                           // Text slice
let mutable_string: String = String::from("Hello, world!");   // String on the heap
```

## Conversion between types

```rust
// &str → String
let to_string: String = text.to_string();   // Creates a copy on the heap
let to_string: String = String::from(text);   // Alternative

// String → &str (automatic coercion via Deref)
let to_str: &str = &mutable_string;
```

## Converting to and from other types

```rust
let string_to_integer: i32 = string.parse().unwrap_or(0);  // Returns 0 if it fails
let integer_to_string: String = integer.to_string();
```
`.parse()` returns a [[programming/rust/Option and Result#Result <T, E >|Result]].

## Text string methods

In addition to the slice methods:

```rust
s.split(" ");              // splits by a separator
s.split_whitespace();      // splits by any whitespace
s.lines();                 // splits by line breaks
s.trim();                  // removes leading and trailing spaces

s.to_uppercase();          // uppercase
s.to_lowercase();          // lowercase

s.chars();                 // iterator over characters (Unicode)
s.bytes();                 // iterator over bytes
s.char_indices();          // iterator of (index, character) tuples
```

> [!warning]
> Rust strings are UTF-8. Accessing a character by index is not always O(1), since a Unicode character can occupy several bytes. Use `.chars()` to iterate over characters.

> Next: [[programming/rust/Ownership and Borrowing|Ownership and Borrowing]]