Rust permite ejecutar múltiples tareas a la vez con garantías de seguridad en tiempo de compilación. No se pueden crear condiciones de carrera (race conditions) sin que el compilador lo impida.

# Hilos

Se crean con `std::thread::spawn`. Cada hilo ejecuta una [[Functions and Closures#Closures|closure]] en paralelo.

```rust
use std::thread;

thread::spawn(|| {
    println!("Hello from another thread");
});
```

## Esperar a que termine un hilo

`thread::spawn` devuelve un `JoinHandle`. Llama a `.join()` para bloquear el hilo principal hasta que el otro termine:

```rust
use std::thread;

let thread = thread::spawn(|| {
    println!("Hello from another thread");
});

thread.join().unwrap(); // Bloquea hasta que el hilo termina
```

## Capturar variables con move

Para que un hilo acceda a datos del hilo principal, es necesario transferir la propiedad (ownership) con `move`. Consulta [[Ownership and Borrowing#Move semantics|Ownership y move semantics]].

```rust
use std::thread;

let message = String::from("Hello");

let thread = thread::spawn(move || {
    println!("{}", message); // Toma ownership de 'message'
});

thread.join().unwrap();
println!("{}", message); // ERROR: message se movió al hilo
```

> [!note]
> Sin `move`, Rust no permitiría usar `message` en el hilo porque no podría garantizar que los datos sigan vivos mientras el hilo los usa. Con `move`, el hilo toma la propiedad y es responsable de liberarlos.

## Comunicación entre hilos

Los canales (`mpsc`) permiten enviar mensajes entre hilos. `mpsc` significa *multiple producer, single consumer*.

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel(); // tx = transmisor; rx = receptor

thread::spawn(move || {
    tx.send(String::from("Hello")).unwrap();
});

println!("{}", rx.recv().unwrap());
```

### Múltiples mensajes

Se pueden enviar múltiples mensajes con un bucle:

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();

// Emisor (en otro hilo)
thread::spawn(move || {
    for i in 1..=5 {
        tx.send(i).unwrap();
    }
});

// Receptor (hilo principal)
for received in rx {
    println!("{}", received);
}
```

> [!note]
> El bucle `for received in rx` se bloquea hasta recibir cada mensaje. Cuando el `Sender` se destruye (el hilo emisor termina), el bucle finaliza automáticamente.

# Async

Las funciones `async` permiten ejecutar tareas de forma **asíncrona** sin bloquear el hilo. No crean un nuevo hilo; el runtime gestiona múltiples tareas en un grupo (pool) de hilos.

## Futures

Una función `async` devuelve un `Future`:

```rust
async fn read() -> String {
    // ...
}
```

El compilador lo transforma aproximadamente en:

```rust
fn read() -> impl Future<Output = String> {
    // ...
}
```

> [!important]
> Llamar a una función `async` **no ejecuta su código**; solo crea el `Future`. El runtime comienza a ejecutarlo cuando se llama a `.await` sobre él o cuando se le entrega al runtime (por ejemplo, con `tokio::spawn` o `tokio::join!`).

### Cómo ejecutar un Future

```rust
hello();          // No imprime nada (solo crea el Future)
hello().await;    // Ejecuta la función y espera a que termine

let read = read().await;
```

> [!warning]
> `.await` solo se puede usar dentro de un contexto `async`. No puedes usar `.await` en una función `fn` normal.

> [!important]
> Cuando se llama a `.await`, el runtime comienza a ejecutar el `Future` hasta que produce un resultado. Si necesita esperar, cambia a otra tarea.

## Runtime

Para ejecutar una función `async` se necesita un **runtime asíncrono**. Los más populares son `Tokio`, `async-std` y `smol`.

```rust
#[tokio::main]
async fn main() {
    hello().await;
}
```

> [!note]
> `#[tokio::main]` es una [[Macros#Attribute macros|macro de atributo]] que transforma el `main` normal en un `main` asíncrono con el runtime de Tokio.

## Ejecutar una tarea en segundo plano

`tokio::spawn` lanza una tarea async en segundo plano mientras se ejecutan otras tareas, y devuelve un `JoinHandle` para esperar su resultado más tarde.

`JoinHandle.await` espera a la tarea si no ha terminado y devuelve un `Result<T, JoinError>`. Consulta [[Option and Result#Result<T, E>|Option and Result]].

`JoinHandle.await.unwrap()` extrae los datos o hace panic si hay un error (no recomendado).

```rust
async fn download() -> String {
    println!("Start of the task");
    String::from("Data")
}

#[tokio::main]
async fn main() {
    let task = tokio::spawn(download());

    println!("Meanwhile I can do other things");

    match task.await {
        Ok(data) => println!("{data}"),
        Err(e) => println!("The task failed: {e}"),
    }
}
```

> [!note]
> `tokio::spawn` crea una **nueva tarea async**, no un nuevo hilo. El runtime decide en qué hilo ejecutarla.

## Ejecutar múltiples tareas

`tokio::join!` ejecuta los `Future`s pasados como argumentos de forma concurrente y espera a que **todos** terminen.

```rust
async fn task1() -> i32 {}
async fn task2() {}

#[tokio::main]
async fn main() {
    let t1 = task1();
    let t2 = task2();

    let (result1, _) = tokio::join!(t1, t2);
    // Se detiene hasta que todas terminan
}
```

> [!note]
> `tokio::join!` devuelve una tupla con los valores de retorno de todos los `Future`s.

> [!important]
> `tokio::join!` no crea una nueva tarea; alterna el sondeo (polling) entre los `Future`s hasta que terminan.

### Manejo de errores

Si un `Future` falla, los demás siguen ejecutándose.
Para cancelarlos todos si uno falla, usa `tokio::try_join!`.

`tokio::try_join!` solo funciona con `Future`s que devuelven `Result` y todos deben tener el mismo tipo de error.
Su valor de retorno es un `Result` con una `tuple` de todos los valores `Ok` y el `Err` común.

```rust
async fn task1() -> Result<String, Error> {}
async fn task2() -> Result<i32, Error> {}

match tokio::try_join!(task1(), task2()) {  // Result<(String, i32), Error>
    Ok((r1, r2)) => {
        println!("{r1}");
        println!("{r2}");
    }
    Err(e) => {
        println!("One task failed: {e}");
    }
}
```

## Cambio de tarea

El runtime ejecuta una tarea hasta que **cede el control**. Esto ocurre normalmente cuando se hace `.await` sobre un `Future` que aún no ha terminado.

En ese punto, la tarea se suspende y el runtime puede ejecutar otra tarea mientras espera.

```rust
async fn task1() {
    println!("Task 1: start");
    sleep(Duration::from_secs(1)).await;
    println!("Task 1: continues");
}

async fn task2() {
    println!("Task 2: start");
    sleep(Duration::from_secs(1)).await;
    println!("Task 2: continues");
}

#[tokio::main]
async fn main() {
    tokio::join!(task1(), task2());
}
```

Una posible salida sería:

```text
Task 1: start
Task 2: start
Task 1: continues
Task 2: continues
```

> [!note]
> `await` **no bloquea el hilo**. Simplemente suspende la tarea actual para que el runtime pueda ejecutar otras mientras espera.

Cómo funciona:

1. El runtime comienza a ejecutar `task1`.
2. `task1` alcanza `sleep(...).await`.
3. Como el temporizador aún no ha terminado, `task1` se suspende.
4. Lo mismo ocurre con `task2`.
5. Cuando uno de los temporizadores termina, el runtime reanuda la tarea correspondiente.
6. Finalmente, ambas tareas terminan.

> [!important]
> Una tarea **solo cede el control** cuando hace `.await` sobre un `Future` que aún no está listo. Si el `Future` ya ha terminado, la ejecución continúa inmediatamente.

> [!note]
> El orden exacto en que se ejecutan las tareas no está garantizado y puede variar en cada ejecución.

## Resumen

| Característica                          | `future.await`         | `tokio::join!`                      | `tokio::spawn`                            |
| --------------------------------------- | ---------------------- | ----------------------------------- | ----------------------------------------- |
| Ejecuta un `Future`                     | ✓                      | ✓                                   | ✓                                         |
| Número de `Future`                      | 1                      | Varios                              | 1 por `spawn`                             |
| Crea una nueva tarea                    | X                      | X                                   | ✓                                         |
| `main` puede seguir ejecutándose de inmediato | X                | X                                   | ✓                                         |
| Se ejecuta de forma concurrente         | X                      | ✓                                   | ✓                                         |
| Puede ejecutarse en distintos hilos     | X                      | X (misma tarea)                     | ✓ (si el runtime es multihilo)            |
| Devuelve                                | `T`                    | `(T1, T2, ...)`                     | `JoinHandle<T>`                           |
| Se necesita `.await` para obtener el resultado | ✓               | `join!` espera por sí mismo         | ✓ sobre el `JoinHandle`                   |
| Uso típico                              | Esperar una operación  | Esperar varias operaciones relacionadas | Lanzar trabajo independiente en segundo plano |
