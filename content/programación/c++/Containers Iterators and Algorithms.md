# Contenedores

La STL proporciona contenedores para almacenar colecciones de datos. Los más comunes:

| Contenedor           | Descripción                                    |
| -------------------- | ---------------------------------------------- |
| `std::vector`        | Array dinámico (con acceso rápido por índice)  |
| `std::deque`         | Cola de doble extremo, rápida por ambos lados  |
| `std::list`          | Lista doblemente enlazada (inserción rápida)   |
| `std::map`           | Pares clave→valor ordenados por clave          |
| `std::unordered_map` | Pares clave→valor (hash, sin orden)            |
| `std::set`           | Conjunto ordenado (sin duplicados)             |

Todos comparten una API similar a `std::vector` (`size`, `begin`, `end`, etc.).

```cpp
#include <map>
#include <set>
#include <list>

std::map<std::string, int> ages;
ages["Ana"] = 30;
ages["Luis"] = 25;

std::set<int> nums = {3, 1, 2, 3}; // {1, 2, 3} (no duplicates, sorted)
std::list<int> list = {1, 2, 3};
```

> [!note]
> `std::vector` es el contenedor por defecto a menos que se necesite algo específico. `map`/`set` son árboles ordenados; `unordered_map` usa hash (más rápido para búsquedas, pero sin orden).

# Iteradores

Un **iterador** es un objeto que apunta a un elemento de un contenedor y permite recorrerlo de forma uniforme.

```cpp
std::vector<int> vec = {10, 20, 30};

auto it = vec.begin(); // primer elemento
auto end = vec.end();  // elemento POSTERIOR al último (no válido para lectura)

std::cout << *it; // 10 (desreferencia el iterador)
it++;             // avanzar
```

## Recorrido con iteradores

```cpp
for (auto it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}
```

> [!tip]
> En C++ moderno, `for-each` hace esto internamente: `for (int x : vec)`. Los iteradores se usan principalmente con los algoritmos de la STL.

# Algoritmos

La cabecera `<algorithm>` ofrece funciones genéricas sobre rangos `[begin, end)`:

```cpp
#include <algorithm>

std::vector<int> v = {5, 2, 8, 1};

std::sort(v.begin(), v.end());          // ordenar: 1, 2, 5, 8
auto it = std::find(v.begin(), v.end(), 5); // find 5
std::cout << *it; // 5

std::reverse(v.begin(), v.end());       // invertir el orden
int max = *std::max_element(v.begin(), v.end()); // maximum
int min = *std::min_element(v.begin(), v.end()); // minimum
```

## Contar y transformar

```cpp
int count = std::count(v.begin(), v.end(), 5); // cuántos 5 hay
std::transform(v.begin(), v.end(), v.begin(),
               [](int x) { return x * 2; }); // aplicar la lambda a cada elemento
```

## Algoritmos con lambdas

Muchos algoritmos aceptan un **predicado** (función que devuelve `bool`), idealmente una [[programación/c++/Functions#Lambda functions|lambda]]:

```cpp
auto it = std::find_if(v.begin(), v.end(),
                       [](int x) { return x > 3; }); // primero > 3
int has_any = std::any_of(v.begin(), v.end(),
                          [](int x) { return x == 8; }); // is there an 8?
```

> [!note]
> Los algoritmos de la STL aceptan lambdas como argumentos y operan sobre iteradores (`[begin, end)`).

> Siguiente: [[Files|Files]]
