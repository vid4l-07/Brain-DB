# Arrays de estilo C

Array de tamaño fijo definido en tiempo de compilación:

```cpp
int arr[5] = {1, 2, 3, 4, 5}; // Integer array
std::cout << "First element: " << arr[0] << "\n";

int matrix[2][3] = {   // 2D array (matrix)
    {1, 2, 3},
    {4, 5, 6}
};
```

## Iterar sobre un array de estilo C

No existe el for-each en los arrays de estilo C; se recorre con un bucle clásico:

```cpp
for (int i = 0; i < 5; i++) {
    std::cout << arr[i] << "\n";
}
```

## Tamaño del array

```cpp
int arr_size = sizeof(arr) / sizeof(arr[0]); // calcular el tamaño del array
```

## Punteros en arrays

El nombre del array es un puntero a su primer elemento:

```cpp
int* pArr = arr; // El nombre del array es un puntero a su primer elemento
std::cout << *(pArr + 2); // Avanzar el puntero 2 posiciones
```

# Vectores (STL)

Son arrays **dinámicos** que pueden cambiar de tamaño. Requiere `#include <vector>`.

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5}; // Integer vector
vec.push_back(6); // Añadir elemento al final
vec.pop_back();  // Eliminar el último elemento
vec.clear();    // Eliminar todos los elementos
vec.resize(10); // Cambiar el tamaño del vector; si es mayor, añade elementos por defecto (0 para int)

int vec_size = vec.size(); // Vector size
```

## Acceso a elementos

```cpp
vec.at(0) = 42;   // Acceder al primer elemento, lanza una excepción si no existe
vec[1] = 43;    // Acceder al segundo elemento (sin excepción si no existe)

vec.front() = 100; // modifica el primer elemento
vec.back() = 200;  // modifica el último elemento
```

> [!warning]
> `vec[i]` no comprueba los límites: si el índice no existe se produce comportamiento indefinido. `vec.at(i)` sí lanza una excepción (`std::out_of_range`) si el índice no existe.

## Iteradores

```cpp
std::vector<int>::iterator it = vec.begin(); // Apunta al primer elemento
std::vector<int>::iterator itEnd = vec.end(); // Apunta al elemento POSTERIOR al último
std::vector<int>::const_iterator cit = vec.cbegin(); // Iterador constante, no permite modificar el valor

std::cout << *it << "\n"; // Acceder al valor usando *

it++; // Avanzar al siguiente elemento

vec.insert(vec.begin() + 2, 99); // Inserta 99 en la posición 2, solo con iteradores
```

## Iterar sobre un vector

```cpp
for (int val : vec) { // For-each en vectores
    std::cout << val << "\n";
}

for (auto it = vec.begin(); it != vec.end(); ++it) { // For con iteradores
    std::cout << *it << "\n";
}
```

## Memoria

```cpp
vec.reserve(100); // Reservar memoria de antemano (mejora el rendimiento)
int vec_capacity = vec.capacity(); // Reserved capacity
```

> [!note]
> `reserve` reserva capacidad para evitar reasignaciones cuando se sabe cuántos elementos se van a añadir. `capacity` devuelve cuántos elementos caben sin reasignar.

# Arrays (STL)

Array de tamaño fijo con las ventajas de la STL. Requiere `#include <array>`.

```cpp
std::array<int, 5> arr_stl = {1, 2, 3, 4, 5}; // Array de tamaño fijo de la STL
std::array<int, 5> arr_stl2 = {1, 2, 3, 4, 5}; // Second STL array

bool are_equal = (arr_stl == arr_stl2); // Compare STL arrays

arr_stl.fill(0); // Rellenar todo el array con 0

arr_stl[0] = 10; // Acceder al primer elemento
arr_stl.at(1) = 20; // Acceder al segundo elemento con comprobación de límites

std::cout << arr_stl.front() << "\n"; // Primer elemento
std::cout << arr_stl.back() << "\n";  // Último elemento

int arr_stl_size = arr_stl.size(); // Array size
```

## Iteradores y recorrido

```cpp
std::array<int, 5>::iterator it_arr = arr_stl.begin(); // Iterador al primer elemento
std::array<int, 5>::iterator it_arr_end = arr_stl.end(); // Iterador al elemento POSTERIOR al último
std::array<int, 5>::const_iterator cit_arr = arr_stl.cbegin(); // Iterador constante

it_arr++; // Avanzar al siguiente elemento
int first_value = *it_arr; // Acceder al valor usando *

// Recorrer std::array con for
for (int i = 0; i < arr_stl.size(); i++) {
    std::cout << arr[i] << "\n";
}

// Recorrer std::array con for-each
for (int n : arr_stl) {
    std::cout << n << "\n";
}
```

## Punteros en std::array

```cpp
int* pArrStl = arr_stl.data(); // Obtener puntero al primer elemento
```

> [!tip]
> Es preferible usar `std::vector` para colecciones de tamaño dinámico, `std::array` para tamaño fijo con métodos de la STL, y evitar los arrays de estilo C salvo que se necesite compatibilidad con C.

> [!note]
> `std::vector` (tamaño dinámico) y `std::array` (tamaño fijo, conocido en tiempo de compilación) tienen APIs equivalentes a los vectores y arrays de la STL.

> Siguiente: [[Operators|Operators]]
