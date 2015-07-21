## Modeling the Problem Domain

The code style and data model are closely connected. Perturb breaks down projects into a series of nested lists and maps over them with it's core functions. As such, the source code of perturb is largely functional, and the functions are designed with mapping and partial application in mind.

Perturb applies a series of steps to transform a project into a list of "alive" mutations.

Step 1: Generate a list of source file paths and a list of test file paths.
Step 2: Combine the source and test file paths into a single list of source:test pairs (matchFiles)
Step 3: For each pair, traverse the source AST to generate a list of mutation descriptors (handleMatch)
Step 4: Filter mutation descriptors into "alive" mutations by executing them with a test runner (runMutation)