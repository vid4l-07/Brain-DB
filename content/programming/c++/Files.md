`#include <fstream>` is needed for file handling (`ifstream`, `ofstream`, `fstream`).

# Stream state methods

`std::ifstream` reads from an input file:

```cpp
std::ifstream file("file.txt");
std::cout << file.is_open() << std::endl; // check if the file opened successfully
std::cout << file.good() << std::endl; // check if the stream is in a good state (no error occurred)
std::cout << file.eof() << std::endl; // check if end of file has been reached
std::cout << file.fail() << std::endl; // check if a read/write operation error occurred
std::cout << file.bad() << std::endl; // check if a physical error occurred (such as a hardware error)
file.close(); // close the file

file.unget(); // remove the last character read from the input stream
file.putback('A'); // put a character back into the input stream
file.clear(); // clear the error states of the stream
```

# Reading and writing

```cpp
std::ifstream input("file.txt"); // input stream associated with a file (reading)
std::ofstream output("output.txt"); // output stream associated with a file (writing)

if(!input.is_open()){ // check that the file opened successfully
    std::cerr << "Error opening input file" << std::endl;
    return 1;
}

std::string line;
while(!input.eof()){   // eof is an end-of-file indicator, it becomes true when there is no more data
    std::getline(input, line); // read a line from the file
    output << line << std::endl; // write the line to the output file
}

while(getline(input, line)){ // another way to read the file, this time without using eof
    output << line << std::endl; // write the line to the output file
}

input.close(); // close the input file
output.close(); // close the output file
```

> [!note]
> It is preferable to use `while(getline(...))` instead of `while(!eof())`: the `eof()` version only becomes `true` after attempting to read and failing, which can cause an extra line to be processed.

# Reading multiple columns

```cpp
// Content of "data.txt"
// 1 Juan 50000
// 2 Ana 60000

// Reading
std::ifstream input("data.txt");

int id;
std::string name;
double salary;

while(input >> id >> name >> salary){ // read space-separated data
    std::cout << "ID: " << id << ", Name: " << name << ", Salary: " << salary << std::endl;
}

input.close();
```

```cpp
// Declarations
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
    output << emp.id << "\t" << emp.name << "\t" << emp.salary << std::endl; // write tab-separated data
}
output.close();
```

> [!note]
> The `>>` operator reads whitespace-separated data. When combined in a condition, the loop ends when there is no more data.

# Character handling

`#include <cctype>` is needed for character manipulation functions:

```cpp
char c;
std::cout << std::isspace(c); // check if the character is whitespace
std::cout << std::isalpha(c); // check if the character is a letter
std::cout << std::isdigit(c); // check if the character is a digit
std::cout << std::isalnum(c); // check if the character is alphanumeric (letter or digit)
std::cout << std::isupper(c); // check if the character is uppercase
std::cout << std::islower(c); // check if the character is lowercase
```

# Reading and writing JSON

The [nlohmann/json](https://github.com/nlohmann/json) library is needed (include `json.hpp` in the project):

```cpp
#include "json.hpp"
using json = nlohmann::json;

// Reading JSON
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

// Writing JSON
std::ofstream output_file("output.json");
json output_data;
output_data["firstname"] = "Chris";
output_data["lastname"] = "Riley";
output_data["age"] = 37;
output_data["job"]["description"] = "saleswoman";
output_data["job"]["address"] = "Indiana, USA";

output_file << output_data.dump(4); // write JSON with 4-space indent
output_file.close();
```

# Output formats

```cpp
std::cout << std::hex << 255 << std::oct << 255 << std::dec << 255 << std::endl; // print numbers in hexadecimal, octal, decimal
```
