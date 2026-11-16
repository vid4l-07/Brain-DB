Las **estructuras** (`struct`) y las **clases** (`class`) son tipos de datos que pueden contener múltiples variables (miembros) y funciones relacionadas (métodos).

> [!note]
> La principal diferencia entre ellas es que las clases permiten **herencia**, **polimorfismo** y **encapsulación**, mientras que las estructuras no. Además, los miembros de una estructura son **públicos por defecto** y los de una clase son **privados por defecto**.

# Estructura

Pública por defecto, no requiere funciones miembro ni constructores (aunque se pueden añadir manualmente). Se suele usar para almacenar datos simples sin necesidad de encapsulación ni métodos complejos.

```cpp
struct Person {
	    std::string name;  // Miembro público
	private:  // Miembros privados
		std::string address;
};
```

# Clase

Privada por defecto, puede contener métodos y constructores, y tiene acceso a **herencia**, **polimorfismo** y **encapsulación**.

```cpp
class Animal {
	    int id;  // Miembro privado 
	
	public:  // Miembros públicos
	    std::string species;
	    int age;
};
```

# Constructores

El **constructor** inicializa el objeto cuando se crea. Tiene el mismo nombre que la clase y no devuelve nada.

```cpp
class Person {
public:
    std::string name;
    Person() { name = "Unknown"; }      // Constructor por defecto
    Person(std::string n) : name(n) {}   // Constructor con parámetro
    Person(const Person& other) : name(other.name) {} // Copy
};
```

## Lista de inicialización

Inicializa los miembros **antes** de ejecutar el cuerpo del constructor. Es la forma recomendada:

```cpp
class Person {
    std::string name;
public:
    Person(std::string n) : name(n) {} // inicializa name con n
};
```

# Punteros a objetos

```cpp
Animal a("Dog", 5);
std::cout << a.species;      // We use . on objects
a.greet();

Animal* ptr = &a;        // ptr is a pointer to object a
std::cout << ptr->species;      // We use -> on pointers
ptr->greet();

std::cout << (*ptr).species;  // Otra forma de acceder a un miembro
(*ptr).greet();  // Otra forma de llamar a un método
```

> [!note]
> Para acceder a los miembros de un **objeto** se usa `.`. Para acceder a los miembros de un **puntero a un objeto** se usa `->` (que equivale a desreferenciar y luego usar `.`).

# Sobrecarga de operadores

C++ permite definir cómo se comportan los operadores (`+`, `++`, `==`, `<`, `<<`, etc.) cuando se usan con objetos de una clase o estructura.

Esto se hace definiendo una función llamada `operator` seguida del operador:

```cpp
class Point {
public:
    int x;
    int y;

    Point(int x, int y) : x(x), y(y) {}

    Point operator+(const Point& other) {
        return Point(x + other.x, y + other.y);
    }
};
```

Ahora puedes usar `+` directamente con objetos Point:

```cpp
Point a(2, 3);
Point b(4, 5);

Point c = a + b;

std::cout << c.x << ", " << c.y;
// 6, 8
```

# Destructor

El **destructor** se ejecuta automáticamente cuando el objeto sale del ámbito (o se elimina). Se utiliza para liberar recursos. Lleva `~` y el nombre de la clase:

```cpp
class Resource {
public:
    Resource() { /* acquire the resource */ }
    ~Resource() { /* release the resource */ }
};
```

> [!note]
> El destructor se llama automáticamente al salir del ámbito, incluso si hay una excepción. Esta es la base de [[Dynamic Memory and Smart Pointers|RAII]].

> [!warning]
> Si la clase tiene un destructor, es importante pensar en el manejo de copias y movimientos de la clase ([[Move Semantics#Rule of Three|Regla de los Tres]]). De lo contrario, puede haber dobles liberaciones o fugas.

# Separar declaración y definición

## Definir métodos fuera de la clase

Los métodos se pueden **declarar** dentro de la clase y **definir** más tarde, fuera de ella, usando `Clase::metodo`. Esto funciona igual para `class` y `struct`:

```cpp
class Person {
	public:
	    std::string name;
	    Person(std::string n);  // Solo declaración
	    void greet();           // Solo declaración
};

// Definición fuera de la clase
Person::Person(std::string n) : name(n) {}

void Person::greet() {
    std::cout << "Hello, I'm " << name << std::endl;
}
```

> [!note]
> Un método solo se puede definir una vez, pero se puede declarar tantas veces como quieras.

## Archivos diferentes

La forma habitual de organizar un proyecto es separar las **declaraciones** (qué existe) de las **definiciones** (cómo funciona) en distintos archivos. De esta manera, otros archivos pueden usar la clase simplemente incluyendo la cabecera, sin incluir la implementación.

### Archivo de cabecera `.h`

Contiene solo las declaraciones, incluye las cabeceras que necesita la interfaz y utiliza **include guards**:

```cpp
#ifndef PERSONA_H
#define PERSONA_H

class Person {
public:
    std::string name;
    Person(std::string n);  // Solo declaración
    void greet();           // Solo declaración
};

#endif
```

> [!warning]
> Los **include guards** (`#ifndef` / `#define` / `#endif`) evitan que el archivo se incluya dos veces. Sin ellos, la clase se declararía repetidamente y causaría un error de compilación.
> `#pragma once` también es válido.

### Archivo de implementación `.cpp`

Contiene las definiciones. Incluye su propia cabecera para verificar que coinciden con las declaraciones:

```cpp
#include "Person.h"

Person::Person(std::string n) : name(n) {}

void Person::greet() {
    std::cout << "Hello, I'm " << name << std::endl;
}
```

> [!important]
> Las cabeceras de la biblioteca estándar se incluyen con `<...>` y las del proyecto con `"..."`.

### Archivo que usa la clase

Solo necesita incluir la cabecera para usar la clase:

```cpp
#include "Person.h"

int main() {
    Person p("Ana");
    p.greet();
    return 0;
}
```

### Compilación

Solo es necesario pasar los archivos de implementación (`.cpp`) al compilador.

```bash
g++ main.cpp Person.cpp -o program
```

> Siguiente: [[Inheritance and Polymorphism|Inheritance and Polymorphism]]
