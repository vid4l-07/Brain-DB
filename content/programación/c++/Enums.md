Las **enumeraciones** (`enum`) permiten definir un conjunto de valores con nombre. Por defecto, cada valor toma un entero consecutivo empezando desde 0.

# enum clásico

```cpp
enum Color { RED, GREEN, BLUE }; // RED=0, GREEN=1, BLUE=2
enum Day { MONDAY=1, TUESDAY=2, WEDNESDAY=3 }; // MONDAY=1, TUESDAY=2, WEDNESDAY=3
Color background = RED;
```

> [!note]
> Los valores de un `enum` toman automáticamente enteros consecutivos (0, 1, 2, ...), pero se les pueden asignar valores explícitos como en `Day`.

# enum class (C++11)

`enum class` es la forma **recomendada** en C++ moderno: sus valores viven en su propio ámbito y no se convierten implícitamente a enteros.

```cpp
enum class Color { RED, GREEN, BLUE };
enum class NewColor { RED, GREEN }; // Los nombres pueden repetirse sin conflicto

Color c = Color::RED; // Se debe usar el prefijo Color::
```

> [!warning]
> A diferencia del `enum` clásico, `enum class` no se convierte implícitamente a `int`. Si necesitas el número, haz un cast explícito: `static_cast<int>(Color::GREEN)`.

> [!note]
> Es recomendable usar `enum class` para evitar conflictos de nombres entre varios enums y evitar conversiones implícitas accidentales a entero.

# Usar el valor entero

```cpp
int value = static_cast<int>(Color::BLUE); // Explicitly converts to int
```

> Siguiente: [[programación/c++/Functions|Functions]]
