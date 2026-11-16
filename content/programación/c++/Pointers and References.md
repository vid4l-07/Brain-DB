# Punteros

Los punteros almacenan la **dirección de memoria** donde se encuentra una variable.

## Operador de dirección `&` y operador de desreferencia `*`

```cpp
int number = 5;
std::cout << &number; // & devuelve la dirección de memoria

int* p = &number;  // p es un puntero, almacena la dirección de memoria
int *q = &number;  // misma definición que antes

std::cout << *p;  // * devuelve el valor en esa dirección de memoria
*p = 10;  // cambia el valor en esa dirección de memoria
```

## Declarar múltiples punteros

```cpp
int* p1, p2; // solo p1 es un puntero
int *p3, *p4; // both are pointers
```

## Puntero nulo

```cpp
int* nullPointer = nullptr; // puntero vacío seguro
```

> [!warning]
> Desreferenciar (`*`) un puntero nulo o inválido es comportamiento indefinido y suele provocar un fallo (segfault).

# Referencias

Una **referencia** (`&`) es un alias de una variable existente. Es como un puntero que no se puede redirigir y no puede ser nulo.

```cpp
int number = 5;
int& ref = number;   // ref es un alias de 'number'
ref = 10;            // modifica 'number', que ahora es 10

std::cout << number; // 10
```

# Referencias vs punteros

| Característica       | Referencia `int&`    | Puntero `int*`        |
| -------------------- | -------------------- | --------------------- |
| Puede ser nula       | No                   | Sí (`nullptr`)        |
| Se puede redirigir   | No                   | Sí (`p = &other`)     |
| Sintaxis de acceso   | Igual que la variable | Requiere `*`/`->`    |
| Valor inicial        | Obligatorio          | Opcional              |

# Paso por referencia

Pasar parámetros **por referencia** evita copiar los datos (clave para la eficiencia) y permite modificarlos dentro de la función:

```cpp
void increment(int& n) {  // n es una referencia
    n++;
}

int x = 5;
increment(x);  // x is now 6
```

> [!note]
> Usar `const` con referencias en los parámetros permite leer sin copiar ni modificar: `void display(const std::string& s)`. Esta es la forma más habitual de pasar objetos grandes a funciones.

> [!warning]
> En C++ los punteros y las referencias son manuales: el compilador no comprueba automáticamente si apuntan a memoria válida. Eres responsable de asegurarte de que sean válidos y de no desreferenciar punteros nulos o liberados.

> Siguiente: [[Dynamic Memory and Smart Pointers|Dynamic Memory and Smart Pointers]]
