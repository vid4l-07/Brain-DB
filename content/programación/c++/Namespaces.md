Los **namespaces** permiten agrupar variables, funciones y tipos bajo un nombre, evitando conflictos de nombres entre distintas partes del código o bibliotecas.

# Definición y uso

```cpp
namespace group {
    int var1 = 10;  // Variable en el namespace group
}

namespace another_group {
    double var2 = 2.3; // Variable en el namespace another_group
}
```

Para acceder a las variables de un namespace, se usa el prefijo `namespace::`:

```cpp
auto variable1 = group::var1;
double variable2 = another_group::var2; // Acceder a una variable de otro namespace
```

# Using namespace

Permite usar variables de un namespace sin el prefijo:

```cpp
using namespace group; // Usar variables del namespace group sin el prefijo group::
int var3 = var1;       // var1 del namespace group
```

> [!note]
> `std` (de la biblioteca estándar) es un namespace. Tipos como `std::string`, `std::vector` o `std::cout` usan el prefijo `std::` precisamente por esto.

> [!warning]
> Evita abusar de `using namespace` en programas grandes: puede causar ambigüedades cuando dos namespaces definen el mismo nombre.

> Siguiente: [[Exceptions and Errors|Exceptions and Errors]]
