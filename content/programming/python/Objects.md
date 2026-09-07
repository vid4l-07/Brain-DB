# Inheritance

A class can inherit attributes and methods from another class.

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
> `Dog` and `Cat` inherit from `Animal`. They override the `speak` method to provide their own implementation.

# super()

`super()` calls methods from the **parent class**:

```python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)   # call parent __init__
        self.breed = breed
```

```python
dog = Dog("Rex", "German Shepherd")
dog.name    # "Rex"
dog.breed   # "German Shepherd"
```

## Calling parent methods

```python
class Animal:
    def speak(self):
        print("Generic sound")

class Dog(Animal):
    def speak(self):
        super().speak()         # print "Generic sound" first
        print("Woof")           # then add own behavior
```

# Polymorphism

Different classes can implement the same method with different behavior:

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
> Polymorphism works because Python uses **duck typing**: if an object has the method, it can be used, regardless of its class.

# Properties

Properties allow controlled access to attributes using `@property`:

```python
class Person:
    def __init__(self, name, age):
        self.__name = name    # private attribute (name mangling)
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
p.name            # "Ana" (uses getter)
p.name = "Luis"   # uses setter
p.name = ""       # ValueError: Name cannot be empty
```

> [!note]
> `__name` uses **name mangling**: Python internally renames it to `_Person__name` to avoid name conflicts in subclasses. It is not truly private, but signals it should not be accessed directly.

# Types of attributes

| Type | Syntax | Description |
|------|--------|-------------|
| Public | `self.attr` | Accessible from anywhere |
| Protected | `self._attr` | Convention: internal use (not enforced) |
| Private | `self.__attr` | Name mangling: `_ClassName__attr` |

```python
class Example:
    def __init__(self):
        self.public = 1
        self._protected = 2
        self.__private = 3

obj = Example()
obj.public          # 1
obj._protected      # 2 (accessible but not recommended)
# obj.__private     # AttributeError
obj._Example__private   # 3 (access via name mangling)
```

> Next: [[Modules and Packages]]
