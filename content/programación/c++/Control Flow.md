# Condicionales

## if / else

```cpp
int c = 5;

if (i > 0) {
    std::cout << "var is positive\n";
    return 0; 
} else {
    std::cout << "var is negative\n";
    return 1;
}
```

> [!note]
> En C++ las condiciones no necesitan ser estrictamente `bool`: cualquier valor distinto de `0` se considera verdadero.

# Bucles

## while

```cpp
int c = 5;
while (c > 0) {
    int d = 4; // Variable temporal dentro del while (ámbito local)
    std::cout << c + d;
    c--;
    if (c == 2) continue; // continue salta a la siguiente iteración
    if (c == 1) break;    // break sale del bucle
}

std::string d = "hello"; // d es distinta de la d del while
```

> [!note]
> Las variables declaradas dentro del bucle tienen ámbito local. Una variable con el mismo nombre fuera del bucle es completamente diferente.

## do-while

Se ejecuta **al menos una vez** porque la condición se comprueba al final:

```cpp
int e_var = 0;
do {
    std::cout << "Runs at least once\n";
    e_var++;
} while(e_var < 1);
```

## for

```cpp
for (int j = 0; j <= 10; j++) { // j=0 to j<=10 step 1
    std::cout << j << "\n";
}
```

# Switch

Solo funciona con enteros, `char` o [[programación/c++/Enums|Enums]]:

```cpp
switch (a) { // Solo funciona con enteros o chars
    case 1: // a == 1
        std::cout << "a is 1\n";
        break; // Salir del switch para evitar pasar al siguiente caso
    case e: // a == 2 (constants can be used)
        std::cout << "a is 2\n";
        break;
    // case i: // No se pueden usar variables, solo constantes
    //     std::cout << "a is i\n";
    //     break;
    default: // Ninguno de los casos anteriores
        std::cout << "a is neither 1 nor 2\n";
        break;
}
```

> [!warning]
> Dentro de `case` solo se pueden usar **constantes**, no variables. Además, olvidar el `break` provoca que la ejecución "caiga" al siguiente `case`.

> Siguiente: [[programación/c++/Enums|Enums]]
