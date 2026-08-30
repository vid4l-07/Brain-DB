# Containers

The STL provides containers for storing data collections. The most common ones:

| Container            | Description                                   |
| -------------------- | --------------------------------------------- |
| `std::vector`        | Dynamic array (with fast index access)        |
| `std::deque`         | Double-ended queue, fast from both ends       |
| `std::list`          | Doubly linked list (fast insertion)           |
| `std::map`           | Key→value pairs sorted by key                 |
| `std::unordered_map` | Key→value pairs (hash, unordered)             |
| `std::set`           | Ordered set (no duplicates)                   |

All share a similar API to `std::vector` (`size`, `begin`, `end`, etc.).

```cpp
#include <map>
#include <set>
#include <list>

std::map<std::string, int> ages;
ages["Ana"] = 30;
ages["Luis"] = 25;

std::set<int> nums = {3, 1, 2, 3}; // {1, 2, 3} (no duplicates, sorted)
std::list<int> list = {1, 2, 3};
```

> [!note]
> `std::vector` is the default container to use unless you need something specific. `map`/`set` are ordered trees; `unordered_map` uses hash (faster for lookups but unordered).

# Iterators

An **iterator** is an object that points to a container element and allows uniform traversal.

```cpp
std::vector<int> vec = {10, 20, 30};

auto it = vec.begin(); // first element
auto end = vec.end();  // element AFTER the last one (not valid for reading)

std::cout << *it; // 10 (dereference the iterator)
it++;             // advance
```

## Traversing with iterators

```cpp
for (auto it = vec.begin(); it != vec.end(); ++it) {
    std::cout << *it << " ";
}
```

> [!tip]
> In modern C++, `for-each` does this internally: `for (int x : vec)`. Iterators are mainly used with STL algorithms.

# Algorithms

The `<algorithm>` header offers generic functions over ranges `[begin, end)`:

```cpp
#include <algorithm>

std::vector<int> v = {5, 2, 8, 1};

std::sort(v.begin(), v.end());          // sort: 1, 2, 5, 8
auto it = std::find(v.begin(), v.end(), 5); // find 5
std::cout << *it; // 5

std::reverse(v.begin(), v.end());       // reverse the order
int max = *std::max_element(v.begin(), v.end()); // maximum
int min = *std::min_element(v.begin(), v.end()); // minimum
```

## Counting and transforming

```cpp
int count = std::count(v.begin(), v.end(), 5); // how many 5s are there
std::transform(v.begin(), v.end(), v.begin(),
               [](int x) { return x * 2; }); // apply the lambda to each element
```

## Algorithms with lambdas

Many algorithms accept a **predicate** (function that returns `bool`), ideally a [[programming/c++/Functions#Lambda functions|lambda]]:

```cpp
auto it = std::find_if(v.begin(), v.end(),
                       [](int x) { return x > 3; }); // first > 3
int has_any = std::any_of(v.begin(), v.end(),
                          [](int x) { return x == 8; }); // is there an 8?
```

> [!note]
> STL algorithms accept lambdas as arguments and operate on iterators (`[begin, end)`). 

> Next: [[programming/c++/Files|Files]]
