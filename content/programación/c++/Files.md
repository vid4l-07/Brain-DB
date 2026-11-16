Se necesita `#include <fstream>` para el manejo de archivos (`ifstream`, `ofstream`, `fstream`).

# Métodos de estado del stream

`std::ifstream` lee desde un archivo de entrada:

```cpp
std::ifstream file("file.txt");
std::cout << file.is_open() << std::endl; // comprobar si el archivo se abrió correctamente
std::cout << file.good() << std::endl; // check if the stream is in a good state (no error occurred)
std::cout << file.eof() << std::endl; // comprobar si se ha alcanzado el final del archivo
std::cout << file.fail() << std::endl; // check if a read/write operation error occurred
std::cout << file.bad() << std::endl; // check if a physical error occurred (such as a hardware error)
file.close(); // cerrar el archivo

file.unget(); // eliminar el último carácter leído del flujo de entrada
file.putback('A'); // devolver un carácter al flujo de entrada
file.clear(); // clear the error states of the stream
```

# Lectura y escritura

```cpp
std::ifstream input("file.txt"); // flujo de entrada asociado a un archivo (lectura)
std::ofstream output("output.txt"); // flujo de salida asociado a un archivo (escritura)

if(!input.is_open()){ // comprobar que el archivo se abrió correctamente
    std::cerr << "Error opening input file" << std::endl;
    return 1;
}

std::string line;
while(!input.eof()){   // eof es un indicador de fin de archivo, se vuelve true cuando no hay más datos
    std::getline(input, line); // leer una línea del archivo
    output << line << std::endl; // escribir la línea en el archivo de salida
}

while(getline(input, line)){ // otra forma de leer el archivo, esta vez sin usar eof
    output << line << std::endl; // escribir la línea en el archivo de salida
}

input.close(); // cerrar el archivo de entrada
output.close(); // cerrar el archivo de salida
```

> [!note]
> Es preferible usar `while(getline(...))` en lugar de `while(!eof())`: la versión con `eof()` solo se vuelve `true` después de intentar leer y fallar, lo que puede provocar que se procese una línea extra.

# Lectura de varias columnas

```cpp
// Contenido de "data.txt"
// 1 Juan 50000
// 2 Ana 60000

// Lectura
std::ifstream input("data.txt");

int id;
std::string name;
double salary;

while(input >> id >> name >> salary){ // leer datos separados por espacios
    std::cout << "ID: " << id << ", Name: " << name << ", Salary: " << salary << std::endl;
}

input.close();
```

```cpp
// Declaraciones
struct Employee {
    int id;
    std::string name;
    double salary;
};

Employee emp1 = {1, "Juan", 50000};
Employee emp2 = {2, "Ana", 60000};
std::vector<Employee> employees = {emp1, emp2};

// Writing
std::ofstream output("data_output.txt");
for(const auto& emp : employees){
    output << emp.id << "\t" << emp.name << "\t" << emp.salary << std::endl; // escribir datos separados por tabulaciones
}
output.close();
```

> [!note]
> El operador `>>` lee datos separados por espacios en blanco. Al combinarse en una condición, el bucle termina cuando no hay más datos.

# Manejo de caracteres

Se necesita `#include <cctype>` para las funciones de manipulación de caracteres:

```cpp
char c;
std::cout << std::isspace(c); // comprobar si el carácter es un espacio en blanco
std::cout << std::isalpha(c); // comprobar si el carácter es una letra
std::cout << std::isdigit(c); // comprobar si el carácter es un dígito
std::cout << std::isalnum(c); // comprobar si el carácter es alfanumérico (letra o dígito)
std::cout << std::isupper(c); // comprobar si el carácter es mayúscula
std::cout << std::islower(c); // comprobar si el carácter es minúscula
```

# Lectura y escritura de JSON

Se necesita la biblioteca [nlohmann/json](https://github.com/nlohmann/json) (incluir `json.hpp` en el proyecto):

```cpp
#include "json.hpp"
using json = nlohmann::json;

// Lectura de JSON
std::ifstream json_file("file.json");
json data;
json_file >> data;
json_file.close();

std::string firstname = data["firstname"];
std::string lastname = data["lastname"];
int age = data["age"];
std::string job_description = data["job"]["description"];
std::string job_address = data["job"]["address"];

std::cout << "First Name: " << firstname << lastname << age << job_description << job_address << std::endl;

// Escritura de JSON
std::ofstream output_file("output.json");
json output_data;
output_data["firstname"] = "Chris";
output_data["lastname"] = "Riley";
output_data["age"] = 37;
output_data["job"]["description"] = "saleswoman";
output_data["job"]["address"] = "Indiana, USA";

output_file << output_data.dump(4); // escribir JSON con sangría de 4 espacios
output_file.close();
```

# Formatos de salida

```cpp
std::cout << std::hex << 255 << std::oct << 255 << std::dec << 255 << std::endl; // imprimir números en hexadecimal, octal y decimal
```
