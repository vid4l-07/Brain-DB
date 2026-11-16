# Tipos de datos básicos

| Tipo              | Descripción                                       |
| ----------------- | ------------------------------------------------- |
| `int`             | Entero con signo                                  |
| `float`           | Coma flotante (menos preciso que `double`)        |
| `double`          | Coma flotante de doble precisión                  |
| `char`            | Carácter individual (comillas simples `'A'`)      |
| `bool`            | Booleano (`true` / `false`)                       |
| `std::string`     | Cadena de texto (requiere `#include <string>`)    |
| `long`            | Entero con signo de mayor tamaño                  |
| `short`           | Entero con signo de menor tamaño                  |
| `unsigned int`    | Entero sin signo (positivo)                       |

```cpp
float f = 3.14f;      // float (menos preciso que double pero usa menos memoria); la "f" indica que es un float
char letter = 'A';    // char (single quotes)
bool boolean = true;

std::string greeting = "Hello"; // std::string requiere std:: porque está en el namespace de la biblioteca string
```

# Inicialización uniforme (C++11)

```cpp
int x{5};
double y{2.71};
```

# Declarar sin inicializar

```cpp
int var;      // Declarar variable (sin inicializar)
std::cin >> var; // Leer valor de la entrada
```

# auto

`auto` deduce el tipo automáticamente, sin tener que escribirlo a mano:

```cpp
auto code = 65;    // auto detecta el tipo automáticamente (int en este caso)
char character = code; // interprets 65 as char 'A' in ASCII

auto name = std::string("Ana"); // auto deduces std::string
```

Resulta especialmente útil con tipos largos o iteradores:

```cpp
auto it = vec.begin(); // en lugar de std::vector<int>::iterator it
```

> [!tip]
> `auto` deduce el tipo en tiempo de compilación; una vez deducido es como si hubieras escrito el tipo a mano. El tipo no cambia en tiempo de ejecución.

> [!note]
> `auto` se puede combinar con `const` y `&` (referencias), por ejemplo `const auto& x = vec;`. Esto se verá en [[Arrays and Vectors|Arrays and Vectors]].

# Conversión implícita

En C++ los tipos se pueden convertir de forma implícita.

```cpp
int value = 1;
bool boolean = value; // true (cualquier valor distinto de 0)

if (value) {
    std::cout << "value is true\n";
}
```

> [!warning]
> En C++ cualquier valor distinto de `0` se convierte en `true` en un contexto booleano. Hay que tener cuidado con estas conversiones implícitas, ya que un entero distinto de cero siempre se evalúa como verdadero.

# Constantes

Se declaran con `const` o `constexpr`.

## const

Valor que no cambia **en tiempo de ejecución**:

```cpp
const int e = 2;
```

## constexpr

Valor calculado **en tiempo de compilación**, lo que puede mejorar el rendimiento:

```cpp
constexpr double pi = 3.14;
constexpr int square(int n) { return n * n; } // función 'constexpr'
int area = square(5); // computed at compile time
```

> [!note]
> `constexpr` garantiza que el valor se conoce en tiempo de compilación, mientras que `const` solo garantiza que no cambia. `constexpr` implica `const`, pero no al revés.

# Macros

Las macros reemplazan texto en el código **antes** de la compilación. Se definen con `#define`:

```cpp
#define PI 3.14 // Definir una constante con una macro
int area = PI * 5 * 5; // Usar la macro para calcular el área de un círculo con radio 5

#define MAX(a, b) ((a) > (b) ? (a) : (b)) // Macro para obtener el máximo de dos valores
int maxVal = MAX(10, 20); // maxVal = 20
```

> [!warning]
> No se recomienda usar macros para constantes; es mejor usar `const` o `constexpr`. Las macros no respetan el tipo ni el ámbito y se expanden textualmente.

> Siguiente: [[programación/c++/Strings|Strings]]
