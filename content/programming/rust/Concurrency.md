Rust allows running multiple tasks at once with safety guarantees at compile time. You cannot create race conditions without the compiler preventing you.

# Threads

They are created with `std::thread::spawn`. Each thread runs a [[programming/rust/Functions and Closures#Closures|closure]] in parallel.

```rust
use std::thread;

thread::spawn(|| {
    println!("Hello from another thread");
});
```

## Waiting for a thread to finish

`thread::spawn` returns a `JoinHandle`. Call `.join()` to block the main thread until the other one finishes:

```rust
use std::thread;

let thread = thread::spawn(|| {
    println!("Hello from another thread");
});

thread.join().unwrap(); // Blocks until the thread finishes
```

## Capturing variables with move

For a thread to access data from the main thread, you need to transfer ownership with `move`. See [[programming/rust/Ownership and Borrowing#Move semantics|Ownership and move semantics]].

```rust
use std::thread;

let message = String::from("Hello");

let thread = thread::spawn(move || {
    println!("{}", message); // Takes ownership of 'message'
});

thread.join().unwrap();
println!("{}", message); // ERROR: message was moved into the thread
```

> [!note]
> Without `move`, Rust would not allow using `message` in the thread because it could not guarantee that the data stays alive while the thread uses it. With `move`, the thread takes ownership and is responsible for freeing it.

## Communication between threads

Channels (`mpsc`) allow sending messages between threads. `mpsc` stands for *multiple producer, single consumer*.

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel(); // tx = transmitter; rx = receiver

thread::spawn(move || {
    tx.send(String::from("Hello")).unwrap();
});

println!("{}", rx.recv().unwrap());
```

### Multiple messages

Multiple messages can be sent with a loop:

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();

// Sender (in another thread)
thread::spawn(move || {
    for i in 1..=5 {
        tx.send(i).unwrap();
    }
});

// Receiver (main thread)
for received in rx {
    println!("{}", received);
}
```

> [!note]
> The `for received in rx` loop blocks until each message is received. When the `Sender` is destroyed (the sender thread finishes), the loop ends automatically.

# Async

`async` functions allow executing tasks **asynchronously** without blocking the thread. They do not create a new thread; the runtime manages multiple tasks in a pool of threads.

## Futures

An `async` function returns a `Future`:

```rust
async fn read() -> String {
    // ...
}
```

The compiler transforms it approximately into:

```rust
fn read() -> impl Future<Output = String> {
    // ...
}
```

> [!important]
> Calling an `async` function **does not execute its code**; it only creates the `Future`. The runtime starts executing it when `.await` is called on it or when it is handed over to the runtime (for example, with `tokio::spawn` or `tokio::join!`).

### How to execute a Future

```rust
hello();          // Does not print anything (only creates the Future)
hello().await;    // Executes the function and waits for it to finish

let read = read().await;
```

> [!warning]
> `.await` can only be used inside an `async` context. You cannot `.await` in a normal `fn` function.

> [!important]
> When `.await` is called, the runtime starts executing the `Future` until it produces a result. If it needs to wait, it switches to another task.

## Runtime

To execute an `async` function, an **async runtime** is needed. The most popular ones are `Tokio`, `async-std` and `smol`.

```rust
#[tokio::main]
async fn main() {
    hello().await;
}
```

> [!note]
> `#[tokio::main]` is an [[programming/rust/Macros#Attribute macros|attribute macro]] that transforms the normal `main` into an `async main` with the Tokio runtime.

## Running a task in the background

`tokio::spawn` launches an async task in the background while other tasks run, and returns a `JoinHandle` to wait for its result later.

`JoinHandle.await` waits for the task if it has not finished and returns a `Result<T, JoinError>`. See [[programming/rust/Option and Result#Result<T, E>|Option and Result]].

`JoinHandle.await.unwrap()` extracts the data or panics if there is an error (Not recommended).

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
> `tokio::spawn` creates a **new async task**, not a new thread. The runtime decides which thread to run it on.

## Running multiple tasks

`tokio::join!` runs the `Future`s passed as arguments concurrently and waits for **all** of them to finish.

```rust
async fn task1() -> i32 {}
async fn task2() {}

#[tokio::main]
async fn main() {
    let t1 = task1();
    let t2 = task2();

    let (result1, _) = tokio::join!(t1, t2);
    // It stops until they all finish
}
```

> [!note]
> `tokio::join!` returns a tuple with the return values of all the `Future`s.

> [!important]
> `tokio::join!` does not create a new task; it alternates polling between the `Future`s until they finish.

### Error handling

If one `Future` fails, the other keeps running.
To cancel all of them if one fails, use `tokio::try_join!`.

`tokio::try_join!` only works with `Future`s that return `Result` and they all must have the same error type.
Its return value is a `Result` with a `tuple` of all the `Ok` values and the common `Err`.

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

## Task switching

The runtime executes a task until it **yields control**. This normally happens when `.await` is called on a `Future` that has not finished yet.

At that point, the task is suspended and the runtime can run another task while waiting.

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

A possible output would be:

```text
Task 1: start
Task 2: start
Task 1: continues
Task 2: continues
```

> [!note]
> `await` **does not block the thread**. It simply suspends the current task so the runtime can run others while waiting.

How it works:

1. The runtime starts executing `task1`.
2. `task1` reaches `sleep(...).await`.
3. Since the timer has not finished yet, `task1` is suspended.
4. Same for `task2`.
5. When one of the timers finishes, the runtime resumes the corresponding task.
6. Finally both tasks finish.

> [!important]
> A task **only yields control** when it does `.await` on a `Future` that is not ready yet. If the `Future` has already finished, execution continues immediately.

> [!note]
> The exact order in which tasks run is not guaranteed and can vary on each execution.

## Summary

| Feature                                 | `future.await`         | `tokio::join!`                      | `tokio::spawn`                            |
| --------------------------------------- | ---------------------- | ----------------------------------- | ----------------------------------------- |
| Executes a `Future`                     | ✓                      | ✓                                   | ✓                                         |
| Number of `Future`                      | 1                      | Several                             | 1 per `spawn`                             |
| Creates a new task                      | X                      | X                                   | ✓                                         |
| `main` can continue running immediately | X                      | X                                   | ✓                                         |
| Runs concurrently                       | X                      | ✓                                   | ✓                                         |
| Can run on different threads            | X                      | X (same task)                       | ✓ (if the runtime is multithreaded)       |
| Returns                                 | `T`                    | `(T1, T2, ...)`                     | `JoinHandle<T>`                           |
| `.await` needed to get the result       | ✓                      | `join!` itself waits                | ✓ on the `JoinHandle`                     |
| Typical use                             | Wait for one operation | Wait for several related operations | Launch independent work in the background |
