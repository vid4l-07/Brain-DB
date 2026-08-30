# Conditionals

## if / else

```cpp
int c = 5;

if (i > 0) {
    std::cout << "var is positive\n";
    return 0; 
} else {
    std::cout << "var is negative\n";
    return 1;
}
```

> [!note]
> In C++ conditions do not need to be strictly `bool`: any value different from `0` is considered true.

# Loops

## while

```cpp
int c = 5;
while (c > 0) {
    int d = 4; // Temporary variable inside the while (local scope)
    std::cout << c + d;
    c--;
    if (c == 2) continue; // continue skips to the next iteration
    if (c == 1) break;    // break exits the loop
}

std::string d = "hello"; // d is different from the d in the while
```

> [!note]
> Variables declared inside the loop have local scope. A variable with the same name outside the loop is completely different.

## do-while

Runs **at least once** because the condition is checked at the end:

```cpp
int e_var = 0;
do {
    std::cout << "Runs at least once\n";
    e_var++;
} while(e_var < 1);
```

## for

```cpp
for (int j = 0; j <= 10; j++) { // j=0 to j<=10 step 1
    std::cout << j << "\n";
}
```

# Switch

Only works with integers, `char`, or [[programming/c++/Enums|Enums]]:

```cpp
switch (a) { // Only works with integers or chars
    case 1: // a == 1
        std::cout << "a is 1\n";
        break; // Exit the switch to avoid falling through to the next case
    case e: // a == 2 (constants can be used)
        std::cout << "a is 2\n";
        break;
    // case i: // Variables cannot be used, only constants
    //     std::cout << "a is i\n";
    //     break;
    default: // None of the above cases
        std::cout << "a is neither 1 nor 2\n";
        break;
}
```

> [!warning]
> Inside `case` only **constants** can be used, not variables. Also, forgetting `break` causes execution to "fall through" to the next `case`.

> Next: [[programming/c++/Enums|Enums]]
