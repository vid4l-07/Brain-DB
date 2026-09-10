# Lists

Lists are **mutable**, ordered sequences of elements.

```python
my_list = ["hello", "how are you", "goodbye"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]   # can contain different types
```

## Accessing elements

```python
my_list = ["a", "b", "c", "d"]

my_list[0]        # "a"
my_list[-1]       # "d" (last element)
my_list[1:3]      # ["b", "c"] (slice)
```

## Modifying elements

```python
my_list = ["hello", "how are you", "goodbye"]

my_list[1] = "hello"                # modify by index
my_list[-1] = "see you later"       # modify last element
my_list[2:] = ["see you", "bye"]    # replace from index 2 to the end
my_list[:2] = ["greetings", "good morning"]   # replace from start to index 2
```

> [!warning]
> Lists are mutable, but reassigning a list to a new variable does not copy it. Both names point to the same list in memory:
> ```python
> a = [1, 2, 3]
> b = a
> b.append(4)
> print(a)   # [1, 2, 3, 4] (a is also modified)
> ```
> Use `b = a.copy()` or `b = a[:]` to create a real copy.

## Adding elements

```python
my_list = ["a", "b"]

my_list.append("c")               # add to the end: ["a", "b", "c"]
my_list.insert(1, "x")           # insert at index 1: ["a", "x", "b", "c"]
my_list.extend(["d", "e"])       # add multiple: ["a", "x", "b", "c", "d", "e"]

my_list2 = my_list + ["f", "g"]  # concatenation (creates new list)
```

## Removing elements

```python
my_list = ["a", "b", "c", "d"]

my_list.pop()         # removes and returns "d"
my_list.pop(1)        # removes and returns "b"
my_list.remove("a")   # removes first occurrence of "a"
my_list.clear()       # removes all elements
```

## Searching

```python
my_list = ["a", "b", "c", "b"]

my_list.index("b")      # 1 (first occurrence)
my_list.count("b")      # 2 (number of occurrences)
"b" in my_list          # True (membership check)
```

## Sorting

```python
numbers = [3, 1, 4, 1, 5, 9]

numbers.sort()              # sorts in place (ascending)
numbers.sort(reverse=True)  # sorts in place (descending)
sorted(numbers)             # returns a new sorted list (original unchanged)
```

## List methods

| Method | Description |
|--------|-------------|
| `append(x)` | Add `x` to the end |
| `insert(i, x)` | Insert `x` at index `i` |
| `extend(iterable)` | Add all elements from iterable |
| `pop([i])` | Remove and return element at `i` (last if no index) |
| `remove(x)` | Remove first occurrence of `x` |
| `clear()` | Remove all elements |
| `index(x)` | Return index of first `x` |
| `count(x)` | Count occurrences of `x` |
| `sort()` | Sort in place |
| `reverse()` | Reverse in place |
| `copy()` | Return a shallow copy |

## Built-in functions

```python
numbers = [3, 1, 4, 1, 5, 9]

len(numbers)    # 6 (length)
sum(numbers)    # 23 (sum of elements)
max(numbers)    # 9 (maximum)
min(numbers)    # 1 (minimum)
```

## List comprehension

```python
squares = [x**2 for x in range(5)]           # [0, 1, 4, 9, 16]
evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]
```

---

# Tuples

Tuples are **immutable**, ordered sequences of elements.

```python
tuple1 = ("one", "two", "three")
tuple2 = ("four", "five")
my_tuple = tuple1 + tuple2    # concatenation: ("one", "two", "three", "four", "five")
```

> [!note]
> Strings share properties with tuples: both are immutable and support the same operations (`len`, `count`, `index`, etc.).

## Accessing elements

```python
my_tuple = ("a", "b", "c")
my_tuple[0]       # "a"
my_tuple[-1]      # "c"
my_tuple[1:3]     # ("b", "c")
```

## Unpacking

```python
my_tuple = ("one", "two", "three")
one, two, three = my_tuple   # one = "one", two = "two", three = "three"

# Ignore values with _
a, _, c = (1, 2, 3)      # a = 1, c = 3
```

## Conversion

```python
list(my_tuple)     # converts tuple to list
tuple(my_list)     # converts list to tuple
```

> [!tip]
> Tuples are faster than lists and use less memory. Use them when the data should not change.

---

# Dictionaries

Dictionaries are **mutable** collections of **key-value** pairs. They do not work by index, but by key.
```python
my_dict = {"key1": "value1", "key2": "value2"}
```

## Accessing values

```python
my_dict["key1"]              # "value1"
my_dict.get("key1")          # "value1" (same as [])
my_dict.get("key3", "default")  # "default" (returns default if key doesn't exist)
```

> [!warning]
> Accessing a non-existent key with `[]` raises a `KeyError`. Use `.get()` for safe access.

## Modifying

```python
my_dict["key1"] = "new value1"       # modify existing key
my_dict["key3"] = "value3"           # add new key
my_dict.update({"key4": "value4"})   # add/update multiple keys
```

## Removing

```python
del my_dict["key2"]            # remove by key
my_dict.pop("key1")            # remove and return value
my_dict.popitem()              # remove and return last inserted pair
my_dict.clear()                # remove all elements
```

## Keys and values

```python
my_dict.keys()      # dict_keys(["key1", "key2"])
my_dict.values()    # dict_values(["value1", "value2"])
my_dict.items()     # dict_items([("key1", "value1"), ("key2", "value2")])
```

> [!note]
> `keys()`, `values()` and `items()` return **views**, not lists. Use `list()` to convert them to a list if you need index access.

## Iterating

```python
my_dict = {"key1": "value1", "key2": "value2"}

for key in my_dict:
    print(key, my_dict[key])

for key, value in my_dict.items():
    print(key, value)
```

## Dictionary methods

| Method | Description |
|--------|-------------|
| `get(key[, default])` | Get value by key (returns `default` if not found) |
| `update(other)` | Update/add pairs from another dict |
| `pop(key)` | Remove and return value |
| `popitem()` | Remove and return last pair |
| `keys()` | View of all keys |
| `values()` | View of all values |
| `items()` | View of all (key, value) pairs |
| `copy()` | Shallow copy |

---
# Sets

Sets are **mutable**, unordered collections of **unique** elements.
```python
my_set = {"apple", "banana", "orange"}
numbers = {1, 2, 3, 4, 5}
```

Sets do not allow duplicate elements:
```python
numbers = {1, 2, 2, 3, 3}

print(numbers)    # {1, 2, 3}
```

>[!Note]
>Sets are **unordered**, so you cannot access elements by index or rely on their iteration order.

## Creating sets

```python
my_set = {1, 2, 3}

empty_set = set()        # {} creates an empty dictionary
from_list = set([1, 2, 3])
from_string = set("hello")   # {"h", "e", "l", "o"}
```

## Adding elements

```python
my_set = {1, 2, 3}

my_set.add(4)             # {1, 2, 3, 4}
my_set.update([5, 6, 7])  # add multiple elements
```

>[!Note]
>`add()` adds a single element, while `update()` adds all elements from an iterable.

## Removing elements

```python
my_set = {1, 2, 3, 4}

my_set.remove(2)     # removes 2
my_set.discard(3)    # removes 3 if it exists
my_set.pop()         # removes and returns an arbitrary element
my_set.clear()       # removes all elements
```

>[!Warning]
>`remove()` raises a `KeyError` if the element does not exist. `discard()` does nothing in that case.

## Searching

```python
my_set = {"a", "b", "c"}

"a" in my_set       # True
"x" in my_set       # False

"a" not in my_set   # False
```

Membership checks are generally very fast because sets are implemented using a hash table.

## Set operations

Sets are especially useful for mathematical set operations.

### Union

Returns all elements from both sets, removing duplicates.
```python
a = {1, 2, 3}
b = {3, 4, 5}

a | b
# {1, 2, 3, 4, 5}

a.union(b)
# {1, 2, 3, 4, 5}
```

### Intersection

Returns elements that exist in both sets.
```python
a = {1, 2, 3}
b = {2, 3, 4}

a & b
# {2, 3}

a.intersection(b)
# {2, 3}
```

### Difference

Returns elements that are in the first set but not in the second.
```python
a = {1, 2, 3}
b = {2, 3, 4}

a - b
# {1}

a.difference(b)
# {1}
```

The order matters:
```python
b - a
# {4}
```

### Symmetric difference

Returns elements that belong to either set, but not to both.
```python
a = {1, 2, 3}
b = {2, 3, 4}

a ^ b
# {1, 4}

a.symmetric_difference(b)
# {1, 4}
```

## Comparing sets

```python
a = {1, 2, 3}
b = {3, 1, 2}
c = {1, 2}

a == b        # True
a != c        # True
```

### Subsets and supersets

A set is a **subset** if all of its elements are contained in another set.
```python
a = {1, 2, 3}
b = {1, 2}

b.issubset(a)       # True
b <= a              # True

a.issuperset(b)     # True
a >= b              # True
```

## Disjoint sets

Two sets are disjoint if they have no elements in common.
```python
a = {1, 2}
b = {3, 4}

a.isdisjoint(b)     # True
```

## Copying

Sets are mutable, so assigning one set to another does not create a copy.
```python
a = {1, 2, 3}
b = a

b.add(4)

print(a)    # {1, 2, 3, 4}
```

Use `.copy()` to create a shallow copy:
```python
b = a.copy()
```

## Iterating

```python
my_set = {"apple", "banana", "orange"}

for item in my_set:
    print(item)
```

>[!Warning]
>Since sets are unordered, the iteration order should not be relied upon.

## Set comprehension

Sets support comprehensions similar to lists, but produce a set of unique values.

```python
squares = {x**2 for x in range(5)}
# {0, 1, 4, 9, 16}

evens = {x for x in range(10) if x % 2 == 0}
# {0, 2, 4, 6, 8}
```

## Frozensets

`frozenset` is an **immutable** version of a set.

```python
my_set = frozenset([1, 2, 3])
```

You cannot add or remove elements:

```python
my_set.add(4)       # AttributeError
my_set.remove(1)    # AttributeError
```

Because a `frozenset` is immutable and hashable, it can be used as a dictionary key or as an element of another set.

```python
groups = {
    frozenset({"admin", "user"}),
    frozenset({"guest"})
}
```

>[!Note]
>Normal set elements must be **hashable**, so you can store values such as numbers, strings and tuples, but not mutable values such as lists or dictionaries.

## Set methods

| Method                        | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `add(x)`                      | Add `x` to the set                                |
| `update(iterable)`            | Add all elements from an iterable                 |
| `remove(x)`                   | Remove `x` (raises `KeyError` if missing)         |
| `discard(x)`                  | Remove `x` if it exists                           |
| `pop()`                       | Remove and return an arbitrary element            |
| `clear()`                     | Remove all elements                               |
| `copy()`                      | Return a shallow copy                             |
| `union(other)`                | Return the union of two sets                      |
| `intersection(other)`         | Return common elements                            |
| `difference(other)`           | Return elements only in the first set             |
| `symmetric_difference(other)` | Return elements in either set, but not both       |
| `issubset(other)`             | Check whether this set is a subset                |
| `issuperset(other)`           | Check whether this set is a superset              |
| `isdisjoint(other)`           | Check whether two sets have no elements in common |

## Set operators

| Operator | Description              |
| -------- | ------------------------ |
| `a \| b` | Union                    |
| `a & b`  | Intersection             |
| `a - b`  | Difference               |
| `a ^ b`  | Symmetric difference     |
| `a <= b` | `a` is a subset of `b`   |
| `a >= b` | `a` is a superset of `b` |

> Next: [[programming/python/Control Flow|Control Flow]]
