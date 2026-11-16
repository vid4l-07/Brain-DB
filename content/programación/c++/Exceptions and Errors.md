# Excepciones

El manejo de errores en C++ se basa en tres palabras clave: `try`, `throw` y `catch`.

# Sintaxis

```cpp
try {
    int divisor = 0;
    if (divisor == 0) {
        throw std::runtime_error("Error: division by zero"); // Lanza una excepción
    }
    int result = 10 / divisor; // No se ejecutará si divisor == 0
    std::cout << "Result: " << result << "\n";
}

catch (const std::runtime_error& e) { // Captura la excepción específica
    std::cout << "Caught runtime_error: " << e.what() << "\n";
}

catch (const std::exception& e) { // Captura cualquier otra excepción derivada de std::exception
    std::cout << "Caught standard exception: " << e.what() << "\n";
}

catch (...) { // Captura cualquier otra excepción desconocida
    std::cout << "Caught unknown error\n";
}
```

# Conceptos

1. `try`: Bloque donde puede ocurrir un error.
2. `throw`: Lanza una excepción.
3. `catch`: Captura la excepción y la maneja.
4. El bloque `catch(...)` captura cualquier excepción no manejada por los bloques `catch` anteriores.

> [!note]
> Los bloques `catch` se evalúan en orden, de más específico a más general. La excepción es capturada por el primer `catch` que coincida.

# Excepciones de la STL

La biblioteca estándar define excepciones predefinidas, como `std::out_of_range` (acceso fuera de límites) o `std::invalid_argument`:

```cpp
std::vector<int> v = {1, 2, 3};
try {
    std::cout << v.at(10); // .at(10) lanza std::out_of_range
} catch (const std::out_of_range& e) {
    std::cout << "Index out of bounds\n";
}
```

> [!warning]
> En C++ las excepciones se propagan automáticamente si no se capturan, lo que termina el programa (`std::terminate`) si no hay ningún `catch`.

> Siguiente: [[Pointers and References|Pointers and References]]
