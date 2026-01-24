# Runtime-reverse-engineering-Linuxissa 

A small project demonstrating how to use Frida to dynamically
instrument a Linux binary and observe password checks at runtime.

This project shows how runtime reverse engineering techniques can be used
to understand program behavior without modifying or recompiling the binary,
by hooking standard C library functions such as scanf, strcmp, and puts.

## Security implications

This project demonstrates why hardcoded secrets and client-side
string comparisons are insecure, as runtime instrumentation can
extract or bypass authentication logic without modifying binaries.

## How to run

cd target
gcc -o target target.c

Run the target program:
./target

In another terminal:
python3 scripts/analyze.py

Enter passwords

Type passwords in the target terminal and observe the runtime analysis
in the Frida terminal.

## What this project demonstrates

- Runtime (dynamic) reverse engineering on Linux
- Instrumenting a live process using Frida
- Hooking libc functions to observe:
  - User input
  - String comparisons
  - Program control flow (OK / NO)
 
## Project structure

Runtime-reverse-engineering-Linuxissa/
├── hooks/
│ └── strcmp.js # Frida hook script
├── scripts/
│ └── analyze.py # Python script that attaches to the target
├── target/
│ ├── target.c # Simple password-checking program
│ └── target # Compiled binary
├── README.md

## Requirements

- Linux (tested on Ubuntu)
- Python 3.8+
- Frida (>= 17.x)
- frida-tools
- gcc


## Things I want to do next

After doing this project I would love to learn how to change program logic at runtime. Right now I am basically observing it.
I have few ideas like making strcmp always return 0 and make the program print "OK" no matter the password.




