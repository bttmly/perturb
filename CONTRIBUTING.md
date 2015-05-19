## Modeling the Problem Domain

The code style and data model are closely connected. Perturb breaks down projects into a series of nested lists and maps over them with it's core functions. As such, the source code of perturb is largely functional, and the functions are designed with mapping and partial application in mind.

First, there is the list of pairs of source files and test files. For each pair, there is the list of AST nodes in the source file. For each node there is a list of zero or more mutators.
