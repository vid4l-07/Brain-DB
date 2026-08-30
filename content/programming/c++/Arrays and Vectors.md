# C-style Arrays

Fixed-size array defined at compile time:

```cpp
int arr[5] = {1, 2, 3, 4, 5}; // Integer array
std::cout << "First element: " << arr[0] << "\n";

int matrix[2][3] = {   // 2D array (matrix)
    {1, 2, 3},
    {4, 5, 6}
};
```

## Iterating over a C-style array

There is no for-each in C-style arrays; iterate with a classic loop:

```cpp
for (int i = 0; i < 5; i++) {
    std::cout << arr[i] << "\n";
}
```

## Array size

```cpp
int arr_size = sizeof(arr) / sizeof(arr[0]); // calculate array size
```

## Pointers in arrays

The array name is a pointer to its first element:

```cpp
int* pArr = arr; // The array name is a pointer to its first element
std::cout << *(pArr + 2); // Advance the pointer by 2 positions
```

# Vectors (STL)

They are **dynamic** arrays that can change size. Requires `#include <vector>`.

```cpp
std::vector<int> vec = {1, 2, 3, 4, 5}; // Integer vector
vec.push_back(6); // Add element to the end
vec.pop_back();  // Remove last element
vec.clear();    // Remove all elements
vec.resize(10); // Change vector size, if larger adds default elements (0 for int)

int vec_size = vec.size(); // Vector size
```

## Element access

```cpp
vec.at(0) = 42;   // Access first element, throws exception if it doesn't exist
vec[1] = 43;    // Access second element (no exception if it doesn't exist)

vec.front() = 100; // modifies the first element
vec.back() = 200;  // modifies the last element
```

> [!warning]
> `vec[i]` does not check bounds: if the index doesn't exist it is undefined behavior. `vec.at(i)` does throw an exception (`std::out_of_range`) if the index doesn't exist.

## Iterators

```cpp
std::vector<int>::iterator it = vec.begin(); // Points to the first element
std::vector<int>::iterator itEnd = vec.end(); // Points to the element AFTER the last one
std::vector<int>::const_iterator cit = vec.cbegin(); // Constant iterator, does not allow modifying the value

std::cout << *it << "\n"; // Access the value using *

it++; // Advance to the next element

vec.insert(vec.begin() + 2, 99); // Inserts 99 at position 2, only with iterators
```

## Iterating over a vector

```cpp
for (int val : vec) { // For each in vectors
    std::cout << val << "\n";
}

for (auto it = vec.begin(); it != vec.end(); ++it) { // For with iterators
    std::cout << *it << "\n";
}
```

## Memory

```cpp
vec.reserve(100); // Reserve memory in advance (improves performance)
int vec_capacity = vec.capacity(); // Reserved capacity
```

> [!note]
> `reserve` reserves capacity to avoid reallocations when you know how many elements you will add. `capacity` returns how many elements can be held without reallocating.

# Arrays (STL)

Fixed-size array with STL advantages. Requires `#include <array>`.

```cpp
std::array<int, 5> arr_stl = {1, 2, 3, 4, 5}; // Fixed-size STL array
std::array<int, 5> arr_stl2 = {1, 2, 3, 4, 5}; // Second STL array

bool are_equal = (arr_stl == arr_stl2); // Compare STL arrays

arr_stl.fill(0); // Fill entire array with 0

arr_stl[0] = 10; // Access first element
arr_stl.at(1) = 20; // Access second element with bounds checking

std::cout << arr_stl.front() << "\n"; // First element
std::cout << arr_stl.back() << "\n";  // Last element

int arr_stl_size = arr_stl.size(); // Array size
```

## Iterators and traversal

```cpp
std::array<int, 5>::iterator it_arr = arr_stl.begin(); // Iterator to first element
std::array<int, 5>::iterator it_arr_end = arr_stl.end(); // Iterator to the element AFTER the last one
std::array<int, 5>::const_iterator cit_arr = arr_stl.cbegin(); // Constant iterator

it_arr++; // Advance to the next element
int first_value = *it_arr; // Access the value using *

// Iterate std::array with for
for (int i = 0; i < arr_stl.size(); i++) {
    std::cout << arr[i] << "\n";
}

// Iterate std::array with for-each
for (int n : arr_stl) {
    std::cout << n << "\n";
}
```

## Pointers in std::array

```cpp
int* pArrStl = arr_stl.data(); // Get pointer to first element
```

> [!tip]
> Prefer `std::vector` for dynamic-size collections, `std::array` for fixed-size with STL methods, and avoid C-style arrays unless you need C compatibility.

> [!note]
> `std::vector` (dynamic size) and `std::array` (fixed size, known at compile time) have equivalent APIs to the STL vectors and arrays.

> Next: [[programming/c++/Operators|Operators]]
