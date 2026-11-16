# std::string

La clase `std::string` representa cadenas de texto. Requiere `#include <string>`.

```cpp
std::string greeting = "Hello";
std::string name("Ana"); // Otra forma de crear una cadena
```

# Operaciones básicas

```cpp
std::string a = "Hello";
std::string b = "World";

std::string c = a + " " + b;      // Concatenación: "Hello World"
int len = a.size();               // Longitud de la cadena (también length())

a += "!";                         // Append to end: "Hello!"
```

# Acceso a caracteres

```cpp
char first = a[0];       // Primer carácter (sin comprobación de límites)
char second = a.at(1);   // Segundo carácter (lanza excepción si el índice no existe)
char last = a.back();    // Último carácter
```

# Comparación

Se puede comparar directamente con `==`, `!=`, `<`, etc. (orden lexicográfico):

```cpp
if (a == b) { /* ... */ }
bool starts = a.starts_with("Ho"); // C++20: ¿empieza por "Ho"?
bool ends  = a.ends_with("la");    // C++20: ¿termina en "la"?
```

# Subcadenas y búsqueda

```cpp
std::string sub = a.substr(0, 4);      // Subcadena desde la posición 0, longitud 4
size_t pos = a.find("World");          // Posición de "World", o std::string::npos si no se encuentra
std::string replacement = "Hello World";
replacement.replace(5, 5, "C++");      // Reemplaza desde 5, 5 caracteres => "Hello C++"
```

> [!warning]
> `find` devuelve `std::string::npos` (un número muy grande) si no se encuentra la subcadena. No lo compares directamente con `-1`.

# Conversión

```cpp
int num = std::stoi("42");           // string → int
double d = std::stod("3.14");        // string → double
std::string s = std::to_string(42);  // number → string
```

> [!note]
> `std::string` es una única clase que puede crecer dinámicamente. Los literales como `"Hello"` son en realidad `const char*` (un array de caracteres), pero se convierten implícitamente a `std::string`.

> [!tip]
> `std::string` gestiona su memoria automáticamente ([[Dynamic Memory and Smart Pointers|Dynamic Memory and Smart Pointers]]), por lo que no es necesario liberarla manualmente.

> Siguiente: [[Arrays and Vectors|Arrays and Vectors]]
