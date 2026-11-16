Los smart pointers son estructuras de datos que actúan como punteros pero con comportamiento adicional gestionado automáticamente. A diferencia de las referencias normales, son propietarios de los datos a los que apuntan y se encargan de liberar la memoria cuando salen del ámbito.

# Box\<T\>

`Box<T>` asigna datos en el **heap** en lugar de en la pila (stack). Es el smart pointer más básico y resulta útil para:
- Datos cuyo tamaño se desconoce en tiempo de compilación.
- Crear estructuras de datos recursivas.

```rust
let x: Box<i32> = Box::new(5);
println!("{}", x); // Se desreferencia automáticamente
```

> [!note]
> `Box<T>` implementa el [[Traits|trait]] `Deref`, lo que permite usarlo como una referencia normal.

## Casos de uso

### Tipos de tamaño dinámico

El compilador no conoce el tamaño de una enumeración recursiva sin `Box`:

```rust
// ERROR: tamaño infinito
enum List {
    Node(i32, List),
    End,
}

// OK: Box tiene un tamaño fijo (un puntero)
enum List {
    Node(i32, Box<List>),
    End,
}
```

### Evitar copias costosas

```rust
let big_data: Box<Vec<i32>> = Box::new(vec![1, 2, 3, 4, 5]);
let reference = &big_data; // Pasa una referencia, no copia el vector
```

### Trait objects

`Box<dyn Trait>` permite devolver distintos tipos que implementan el mismo trait. Consulta [[Traits#Trait as return type|Traits como tipo de retorno]].

```rust
fn create(b: bool) -> Box<dyn Greet> {
    if b {
        Box::new(Person)
    } else {
        Box::new(Dog)
    }
}
```

> [!warning]
> `Box<T>` libera la memoria automáticamente cuando sale del ámbito. No hay un `free` manual como en C/C++.

# Rc\<T\>

`Rc<T>` (Reference Counted) permite **múltiples propietarios** de los mismos datos en el heap. Cuenta cuántas referencias existen y solo libera los datos cuando se destruye la última referencia.

```rust
use std::rc::Rc;

let a = Rc::new(vec![1, 2, 3]);
let b = Rc::clone(&a); // Incrementa el contador de referencias
let c = Rc::clone(&a); // Incrementa de nuevo

println!("Count: {}", Rc::strong_count(&a)); // 3
```

> [!note]
> `Rc::clone` no crea una copia de los datos, solo incrementa el contador de referencias. Es muy económico.

```rust
use std::rc::Rc;

let list = Rc::new(vec![1, 2, 3]);
let another_list = list.clone(); // Mismos datos, dos propietarios

println!("{:?}", list);      // OK
println!("{:?}", another_list); // OK
```

> [!warning]
> `Rc<T>` solo funciona en **un único hilo**. No se puede compartir entre hilos. Usa `Arc<T>` para [[Concurrency|concurrencia]].

> [!warning]
> `Rc<T>` es **inmutable** por defecto. No puedes modificar los datos internos directamente. Para ello, usa `RefCell<T>`.

# RefCell\<T\>

`RefCell<T>` implementa la **mutabilidad interior** (interior mutability): permite modificar los datos incluso cuando la referencia es inmutable. La comprobación del borrowing se realiza en **tiempo de ejecución** en lugar de en tiempo de compilación.

```rust
use std::cell::RefCell;

let data = RefCell::new(vec![1, 2, 3]);

// Préstamo inmutable
{
    let read = data.borrow();
    println!("{:?}", read);
}

// Préstamo mutable
data.borrow_mut().push(4);
println!("{:?}", data.borrow()); // [1, 2, 3, 4]
```

> [!warning]
> Si intentas hacer `borrow()` mientras hay un `borrow_mut()` activo (o viceversa), el programa hará **panic** en tiempo de ejecución.

> [!tip]
> Combinar `Rc` y `RefCell` permite tener **múltiples propietarios** que pueden **modificar** los datos:
>
> ```rust
> use std::rc::Rc;
> use std::cell::RefCell;
>
> let shared = Rc::new(RefCell::new(vec![1, 2, 3]));
>
> let owner1 = Rc::clone(&shared);
> let owner2 = Rc::clone(&shared);
>
> owner1.borrow_mut().push(4);
> owner2.borrow_mut().push(5);
>
> println!("{:?}", shared.borrow()); // [1, 2, 3, 4, 5]
> ```

# Arc\<T\>

`Arc<T>` (Atomically Reference Counted) es la versión **segura para hilos** (thread-safe) de `Rc<T>`. Permite compartir datos entre hilos con conteo atómico de referencias.

```rust
use std::sync::Arc;
use std::thread;

let data = Arc::new(vec![1, 2, 3]);

let thread1 = Arc::clone(&data);
let thread2 = Arc::clone(&data);

thread::spawn(move || {
    println!("Thread 1: {:?}", thread1);
});

thread::spawn(move || {
    println!("Thread 2: {:?}", thread2);
});
```

> [!note]
> `Arc<T>` tiene una pequeña sobrecarga en comparación con `Rc<T>` debido a las operaciones atómicas. Úsalo solo cuando necesites compartir datos entre hilos.

> [!warning]
> `Arc<T>` es **inmutable** por defecto, igual que `Rc<T>`. Para modificar datos compartidos entre hilos, combínalo con `Mutex<T>`:

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let data = Arc::new(Mutex::new(vec![1, 2, 3]));

let thread = Arc::clone(&data);
thread::spawn(move || {
    let mut list = thread.lock().unwrap();
    list.push(4);
}).join().unwrap();

println!("{:?}", data.lock().unwrap()); // [1, 2, 3, 4]
```

# Resumen

| Smart pointer | Propietarios | Thread-safe | Mutabilidad             |
|---------------|--------------|-------------|-------------------------|
| `Box<T>`      | Uno          | Sí          | Mutable                 |
| `Rc<T>`       | Varios       | No          | Inmutable               |
| `RefCell<T>`  | Uno          | No          | Mutabilidad interior    |
| `Arc<T>`      | Varios       | Sí          | Inmutable               |

> [!tip]
> - Usa `Box<T>` por defecto para asignar en el heap.
> - Usa `Rc<T>` cuando necesites múltiples propietarios en un único hilo.
> - Usa `RefCell<T>` cuando necesites modificar datos desde referencias inmutables.
> - Usa `Arc<T>` cuando compartas datos entre hilos.

> Siguiente: [[Lifetimes|Lifetimes]]
