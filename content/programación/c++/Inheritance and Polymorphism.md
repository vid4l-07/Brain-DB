# Herencia

La **herencia** permite que una clase (`derivada`) herede los miembros y métodos de otra (`base`).

```cpp
class Animal {          // Base class
	public:
	    std::string species;
	    void eat() { std::cout << "eating..."; }
};

class Dog : public Animal { // Dog hereda de Animal
	public:
	    void bark() { std::cout << "Woof!"; }
};
```

```cpp
Dog d;
d.species = "canine";  // inherited member
d.eat();               // método heredado
d.bark();              // método propio
```

# Tipos de herencia

La palabra clave entre `:` y el nombre de la base controla la visibilidad de los miembros heredados:

| Tipo de herencia | Efecto sobre los miembros públicos de la base      |
| ---------------- | --------------------------------------------------- |
| `public`         | Siguen siendo públicos                              |
| `protected`      | Pasan a ser protegidos (solo para clases derivadas) |
| `private`        | Pasan a ser privados (no accesibles)                |

> [!note]
> `public` es la herencia más común ("es-un"). `protected` permite el acceso solo desde subclases. `private` se usa en raras ocasiones (composición).

# protected

Un miembro `protected` es accesible desde la propia clase y sus clases derivadas, pero no desde fuera:

```cpp
class Base {
protected:
    int data = 5;
};
class Derived : public Base {
public:
    void f() { std::cout << data; } // ok: la clase derivada puede acceder a él
};
```

# Polimorfismo con funciones virtuales

Una función **`virtual`** permite que se llame a la versión de la clase derivada a través de un puntero/referencia a la base:

```cpp
class Animal {
	public:
	    virtual void sound() { std::cout << "generic"; } // virtual
};

class Dog : public Animal {
	public:
	    void sound() override { std::cout << "Woof!"; } // override indica que lo reemplaza
};

class Cat : public Animal {
	public:
	    void sound() override { std::cout << "Meow!"; }
};
```

```cpp
Animal* ptr = new Dog();
ptr->sound(); // "Woof!" (llama a la versión de Dog)
```

> [!warning]
> Sin `virtual`, `ptr->sound()` llamaría a la versión de `Animal` aunque el objeto real sea un `Dog`. `virtual` es lo que permite el polimorfismo.

# Clases abstractas

Una clase con una **función virtual pura** (`= 0`) es **abstracta**: no se puede instanciar, solo sirve como base.

```cpp
class Shape {
	public:
	    virtual double area() const = 0; // pure virtual
};

class Circle : public Shape {
	public:
	    double area() const override { return 3.14 * r * r; }
	private:
	    double r = 1;
};
```

> [!note]
> Una clase abstracta es la forma que tiene C++ de definir una **interfaz** que múltiples clases implementan de manera diferente.


> Siguiente: [[Move Semantics|Move Semantics]]
