**Enumerations** (`enum`) allow defining a set of named values. By default, each value takes a consecutive integer starting from 0.

# Classic enum

```cpp
enum Color { RED, GREEN, BLUE }; // RED=0, GREEN=1, BLUE=2
enum Day { MONDAY=1, TUESDAY=2, WEDNESDAY=3 }; // MONDAY=1, TUESDAY=2, WEDNESDAY=3
Color background = RED;
```

> [!note]
> `enum` values automatically take consecutive integers (0, 1, 2, ...), but you can assign them explicit values like in `Day`.

# enum class (C++11)

`enum class` is the **recommended** form in modern C++: its values live in their own scope and are not implicitly converted to integers.

```cpp
enum class Color { RED, GREEN, BLUE };
enum class NewColor { RED, GREEN }; // Names can be repeated without conflict

Color c = Color::RED; // The Color:: prefix must be used
```

> [!warning]
> Unlike the classic `enum`, `enum class` is not implicitly converted to `int`. If you need the number, do an explicit cast: `static_cast<int>(Color::GREEN)`.

> [!note]
> It is advisable to use `enum class` to avoid name conflicts between multiple enums and to avoid accidental implicit conversions to integer.

# Using the integer value

```cpp
int value = static_cast<int>(Color::BLUE); // Explicitly converts to int
```

> Next: [[programming/c++/Functions|Functions]]