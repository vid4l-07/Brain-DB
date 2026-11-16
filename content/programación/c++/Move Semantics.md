# Lvalues y rvalues

Una expresión es un **lvalue** (left value) si tiene una **dirección de memoria** y se le puede asignar un valor. Un **rvalue** es un valor temporal sin una dirección estable.

```cpp
int x = 5;   // x is an lvalue (has an address)
5            // is an rvalue (temporary)
x + 2        // is an rvalue (temporary result)
```

> [!note]
> Un lvalue puede aparecer en el lado izquierdo de una asignación; un rvalue no: `5 = x;` no es válido.

# Referencias a rvalue (&&)

Una referencia `&&` (rvalue reference) se vincula a valores temporales (rvalues). Permite distinguir si estamos ante un objeto temporal que se puede "robar" o mover:

```cpp
int&& rref = 5;       // rref se vincula al temporal 5
```

# Move semantics

"Mover" un objeto transfiere sus recursos (como el buffer de un `std::string`) en lugar de copiarlos. Es más económico que copiar.

```cpp
std::string a = "Hello very long world";
std::string b = std::move(a); // mueve el contenido de a a b, sin copiar
// a queda en un estado válido pero "vacío/no especificado"
```

> [!warning]
> Después de `std::move`, el objeto de origen queda en un estado válido pero **no especificado** (normalmente vacío). No lo uses a menos que lo reasignes o lo destruyas.

# std::move

`std::move(x)` convierte `x` en un rvalue, permitiendo usar el constructor de movimiento (move constructor) en lugar del constructor de copia.

```cpp
std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = std::move(v1); // v2 steals v1's buffer
```

# Constructor de movimiento y asignación por movimiento

```cpp
class Buffer {
	    int* data;
	public:
	    Buffer(Buffer&& other) noexcept   // move constructor
	        : data(other.data) {
	        other.data = nullptr;        // dejar el origen sin el recurso
	    }
	
	    Buffer& operator=(Buffer&& other) noexcept { // move assignment
	        if (this != &other) {
	            delete[] data;         // liberar el recurso propio
	            data = other.data;
	            other.data = nullptr;
	        }
	        return *this;
	    }
};
```

> [!note]
> El movimiento en C++ es **opcional y explícito**: solo ocurre si usas `std::move` o si el objeto es un rvalue temporal.

# Regla de los Tres / Cinco / Cero

Si una clase gestiona recursos manualmente, debe definir un conjunto coherente de métodos especiales.

## Regla de los Tres

Si defines el **destructor**, el **constructor de copia** o la **asignación por copia**, normalmente necesitas los tres:

- Destructor
- Constructor de copia
- Asignación por copia

## Regla de los Cinco

Con move semantics (C++11), se añaden dos más:

- Constructor de movimiento (move constructor)
- Asignación por movimiento (move assignment)

> [!warning]
> Si defines un destructor pero no la copia ni el movimiento, el compilador genera versiones por defecto que pueden provocar dobles liberaciones o fugas. Definir correctamente solo uno de los cinco suele requerir definirlos todos.

## Regla del Cero

Si la clase **no** gestiona recursos manualmente (utiliza tipos de la STL como `std::string` o `std::vector`), no definas ninguno: deja que el compilador genere todo por defecto. Es lo más sencillo y seguro.

```cpp
class Person {
    std::string name; // la STL gestiona sus recursos
    int age;
    // No se define ningún método especial: regla del cero
};
```

> [!tip]
> En general, es preferible seguir la **Regla del Cero**: utiliza smart pointers y contenedores de la STL para no tener que escribir destructores ni constructores de copia a mano.

> Siguiente: [[Templates|Templates]]
