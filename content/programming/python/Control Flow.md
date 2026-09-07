# Conditionals

## if / elif / else

```python
x = 10

if x > 0:
    print("positive")
elif x == 0:
    print("zero")
else:
    print("negative")
```

> [!note]
> Python uses **indentation** (4 spaces by default) to define code blocks instead of braces `{}`.

## Ternary operator

A concise form of an if expression that returns a value.
```python
x = 10
result = "positive" if x > 0 else "non-positive"
```

# Loops

## for

```python
for i in range(5):
    print(i)    # 0, 1, 2, 3, 4
```

### range()

| Call                       | Description                           |
| -------------------------- | ------------------------------------- |
| `range(stop)`              | 0 to stop-1                           |
| `range(start, stop)`       | start to stop-1                       |
| `range(start, stop, step)` | start to stop-1, incrementing by step |

```python
range(5)         # 0, 1, 2, 3, 4
range(2, 5)      # 2, 3, 4
range(0, 10, 2)  # 0, 2, 4, 6, 8
range(5, 0, -1)  # 5, 4, 3, 2, 1
```

> [!warning]
> `range()` does not include the stop value. `range(5)` goes from 0 to 4.

### Iterating over collections

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)

for index, fruit in enumerate(fruits):
    print(index, fruit)   # 0 apple, 1 banana, 2 cherry
```

### Iterating backwards

```python
my_list = [1, 2, 3]

for i in range(len(my_list) - 1, -1, -1):
    print(my_list[i])   # 3, 2, 1
```

## while

```python
count = 5
while count > 0:
    print(count)
    count -= 1
```

## break, continue, else

```python
for i in range(10):
    if i == 3:
        continue   # skip 3
    if i == 7:
        break      # exit loop at 7
    print(i)       # 0, 1, 2, 4, 5, 6
```

The `for` loop can have an `else` block that runs if the loop completes without `break`:

```python
for i in range(5):
    if i == 10:
        break
else:
    print("loop completed without break")   # this runs
```

# Nested loops

```python
for i in range(3):
    for j in range(3):
        print(f"({i},{j})", end=" ")
    print()
# (0,0) (0,1) (0,2)
# (1,0) (1,1) (1,2)
# (2,0) (2,1) (2,2)
```

> Next: [[programming/python/Functions|Functions]]
