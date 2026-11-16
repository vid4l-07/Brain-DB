# Herencia

Una clase puede heredar atributos y métodos de otra clase.

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "Woof"

class Cat(Animal):
    def speak(self):
        return "Meow"
```

```python
dog = Dog("Rex")
cat = Cat("Michi")

dog.speak()   # "Woof"
cat.speak()   # "Meow"
```

> [!note]
> `Dog` y `Cat` heredan de `Animal`. Sobrescriben el método `speak` para proporcionar su propia implementación.

# super()

`super()` llama a métodos de la **clase padre**:

```python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)   # llamar al __init__ del padre
        self.breed = breed
```

```python
dog = Dog("Rex", "German Shepherd")
dog.name    # "Rex"
dog.breed   # "German Shepherd"
```

## Llamar a métodos de la clase padre

```python
class Animal:
    def speak(self):
        print("Generic sound")

class Dog(Animal):
    def speak(self):
        super().speak()         # imprimir "Generic sound" primero
        print("Woof")           # luego añadir comportamiento propio
```

# Polimorfismo

Diferentes clases pueden implementar el mismo método con comportamientos distintos:

```python
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "Woof"

class Cat(Animal):
    def speak(self):
        return "Meow"

def make_speak(animal):
    print(animal.speak())

make_speak(Dog("Rex"))    # "Woof"
make_speak(Cat("Michi"))  # "Meow"
```

> [!tip]
> El polimorfismo funciona porque Python utiliza **duck typing**: si un objeto tiene el método, se puede usar, independientemente de su clase.

# Propiedades

Las propiedades permiten controlar el acceso a los atributos usando `@property`:

```python
class Person:
    def __init__(self, name, age):
        self.__name = name    # atributo privado (name mangling)
        self.age = age

    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, value):
        if not value:
            raise ValueError("Name cannot be empty")
        self.__name = value
```

```python
p = Person("Ana", 25)
p.name            # "Ana" (usa el getter)
p.name = "Luis"   # usa el setter
p.name = ""       # ValueError: Name cannot be empty
```

> [!note]
> `__name` utiliza **name mangling**: Python lo renombra internamente a `_Person__name` para evitar conflictos de nombres en subclases. No es realmente privado, pero indica que no se debe acceder directamente.

# Tipos de atributos

| Tipo | Sintaxis | Descripción |
|------|--------|-------------|
| Público | `self.attr` | Accesible desde cualquier lugar |
| Protegido | `self._attr` | Convención: uso interno (no se aplica) |
| Privado | `self.__attr` | Name mangling: `_ClassName__attr` |

```python
class Example:
    def __init__(self):
        self.public = 1
        self._protected = 2
        self.__private = 3

obj = Example()
obj.public          # 1
obj._protected      # 2 (accesible pero no recomendado)
# obj.__private     # AttributeError
obj._Example__private   # 3 (acceso mediante name mangling)
```

> Siguiente: [[Modules and Packages]]
