# Stack vs Heap

- **Stack**: memoria automática y rápida, que se libera al salir del ámbito. Variables locales y parámetros.
- **Heap**: memoria dinámica, más lenta, que se reserva y libera manualmente. Útil para datos grandes o de tamaño variable.

# new y delete

Reserva manual en el heap con `new` y `delete`:

```cpp
int* p = new int(5);   // reservar un int en el heap
std::cout << *p;       // 5
delete p;              // liberar la memoria (¡obligatorio!)

int* arr = new int[10]; // dynamic array
delete[] arr;           // liberar el array (con corchetes)
```

> [!warning]
> Olvidar el `delete` provoca **fugas de memoria** (memory leaks). Liberar dos veces o liberar memoria que no fue reservada con `new` es comportamiento indefinido. Por eso, en C++ moderno casi nunca se usa `new`/`delete` directamente.

# Smart pointers

Los **smart pointers** son objetos que gestionan la memoria automáticamente: liberan los recursos cuando dejan de usarse, evitando fugas. Se definen en `#include <memory>`.

## std::unique_ptr

**Único propietario** de la memoria. No se puede copiar, solo mover.

```cpp
std::unique_ptr<int> p = std::make_unique<int>(42);
std::cout << *p; // 42
// Se libera automáticamente al salir del ámbito
```

## std::shared_ptr

Varios punteros **comparten** la propiedad. La memoria se libera cuando se destruye el último `shared_ptr` (conteo de referencias).

```cpp
std::shared_ptr<int> a = std::make_shared<int>(7);
std::shared_ptr<int> b = a; // a y b comparten el mismo int
std::cout << a.use_count(); // 2 (número de propietarios)
```

> [!note]
> `shared_ptr` utiliza **conteo de referencias** (reference counting): la memoria se libera cuando se destruye el último `shared_ptr` que la utiliza. Esto permite compartir los mismos datos entre varias partes del código sin duplicarlos.

## std::weak_ptr

Referencia **débil** que no cuenta como propietario. Se usa para romper ciclos entre `shared_ptr` (dos objetos que se referencian mutuamente nunca se liberarían).

```cpp
std::weak_ptr<int> w = a; // no incrementa use_count
if (auto sp = w.lock()) { // lock() devuelve un shared_ptr si todavía existe
    // usar sp
}
```

> [!warning]
> Si dos objetos se referencian mutuamente con `shared_ptr` (ciclo), nunca se liberan. Rompe el ciclo usando `weak_ptr` en al menos uno de los lados.

# RAII

**RAII** (Resource Acquisition Is Initialization) es el patrón en el que los **recursos** (memoria, archivos, mutexes) se adquieren en el constructor de un objeto y se liberan en el destructor.

```cpp
class File {
    FILE* f;
public:
    File(const char* name) { f = fopen(name, "r"); }
    ~File() { fclose(f); } // se cierra automáticamente al salir del ámbito
};
```

> [!note]
> RAII garantiza la liberación de recursos incluso ante excepciones o un `return` anticipado: el destructor siempre se ejecuta al salir del ámbito. Es la base de los smart pointers y de muchos tipos de la STL (como `std::string` o `std::ofstream`).

> Siguiente: [[programación/c++/Objects|Objects]]
