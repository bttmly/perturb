# TODO

- Explore how to parallelize tests (first thought, create 1 .perturb dir per CPU)

## Plugins
- Figure out how users provide plugins to the library
    - .perturbrc file that is actual Node code
    - putting JS files somewhere that the process can find/require them
    - names of npm modules that can be 'required'

- Example using command line flags/config file to turn on/off mutations
- Example plugging in additional mutation
- Example plugging in additional runner
- Example plugging in alternate AST parser

- Dogfooding is great for development, but should implement an example on a node core library (events?)

- Reconsider if running a matched "pair" really makes sense. Since source files are under mutation, and 
  a single source file may match multiple test files, it may make more sense to mutate the source, run
  all matched test files, then ensure *at least one* fails. This makes the library much more flexible
  as it handles configurations besides (1 source):(1 test)
