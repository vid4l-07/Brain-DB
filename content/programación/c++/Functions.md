# Definición y llamada

Las funciones se definen especificando el tipo de retorno, el nombre y los parámetros entre paréntesis. La función principal es `main`.

```cpp
// Función que suma dos enteros
int sum(int x, int y) {
    return x + y;
}

// Función que devuelve true si el número es positivo
bool isPositive(int n) {
    return n > 0;
}

int main() {  // Función principal
    int sumResult = sum(3, 4);
    bool isPos = isPositive(-5);

    std::cout << "Sum: " << sumResult << ", isPositive(-5): " << isPos << "\n";
}
```

> [!note]
> `main` es el punto de entrada del programa. Devolver `0` indica que finalizó correctamente, y cualquier otro valor indica un error:
> ```cpp
> return 0;  // Terminate the program successfully
> return 1;  // Terminate with error
> return 2;  // Terminate with another type of error
> ```

> [!warning]
> En C++ cada función debe declararse (o definirse) **antes** de usarse. Si usas una función sin declararla primero, el compilador dará un error. Esto se suele resolver con prototipos o cabeceras.

# Parámetros por defecto

Se pueden asignar valores por defecto a los parámetros finales:

```cpp
int power(int base, int exp = 2) { // exp is 2 if not provided
    int r = 1;
    for (int i = 0; i < exp; i++) r *= base;
    return r;
}
power(3);     // 3^2 = 9
power(3, 4);  // 3^4 = 81
```

# Sobrecarga

Pueden existir varias funciones con el mismo nombre si difieren en el tipo o número de parámetros:

```cpp
int sum(int a, int b) { return a + b; }
double sum(double a, double b) { return a + b; } // Same overload
```

# Funciones lambda

Las funciones lambda no tienen nombre, se definen donde se usan y pueden **capturar** variables del entorno circundante.

## Sintaxis

```cpp
[capture](parameters) -> return_type { function body }
```

- **Captura** (entre corchetes): qué variables del entorno se utilizan.
- Los **parámetros** y el **tipo de retorno** son opcionales (se pueden deducir).

## Captura

| Captura | Descripción                                             |
| ------- | ------------------------------------------------------- |
| `[=]`   | Captura todas las variables del entorno por valor       |
| `[&]`   | Captura todas las variables del entorno por referencia  |
| `[var]` | Captura la variable `var` por valor                     |
| `[&var]`| Captura la variable `var` por referencia                |

## Ejemplos

```cpp
// Lambda que suma dos números
auto sum = [](int a, int b) -> int { return a + b; };
std::cout << sum(5, 3); // 8

// Lambda que captura una variable del entorno
int factor = 2;
auto multiply = [factor](int x) -> int { return x * factor; };
std::cout << multiply(5); // 10

// Lambda sin parámetros
auto greet = []() { std::cout << "Hello, world!"; };
greet();
```

> Siguiente: [[Namespaces|Namespaces]]
