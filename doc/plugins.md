# Plugins

## Mutators
**Multiple active**
```typescript
interface MutatorPlugin {
  name: string;
  nodeTypes: Array<string>;
  filter?: (n: ESTree.Node): boolean;
  mutator: (n: ESTree.Node): ESTree.Node;
}
```

A mutator plugin describes a mutation to be applied to an AST node. Multiple mutator plugins can (and should) be active simultaneously. A mutator plugin has the following properties:

- `name`: a unique string name
- `nodeTypes`: an array of [node types]() the mutator may be run on
- `filter`: an optional predicate function that filters out nodes that matched one of the provided node types.
- `mutator`: a function that returns a new AST node to replace the old one. Despite the name, it **must not** actually mutate the old node by changing, adding, or removing it's properties. 

## Matchers
**One active**

Matcher plugins come in two flavors, "generative" and "comparative". Comparative matchers are predicate functions which take a test file and a source file and return `true` when they match. 

An example of comparative matching case might be when test files have names resembling source files, but with some kind of prefix or suffix indicating what they test. The tests on the Node.js [core libraries](https://github.com/nodejs/node/tree/master/test/parallel) often fit this pattern.

By contrast, a generative matcher looks at the string path of a source file and returns the string path of a test file. This would be when, for instance, `/test/thing.js` is the test file for `/lib/thing.js`. Generative matchers imply a 1-1 mapping between test and source files.

A matcher function, of either type, is initialized with a full configuration object, because it almost always needs to know the directory configuration values used.

```typescript
interface MatcherPlugin {
  name: string;
  type: "comparative" | "generative",
  makeMatcher: (cfg: PerturbConfig): GenerativeMatcher | ComparativeMatcher;
}

interface GenerativeMatcher {
  (sourceFile: string): string;
}

interface ComparativeMatcher {
  (sourceFile: string, testFile: string): boolean;
}

```

## Runners
**One active**
```typescript
interface RunnerPlugin {
  name: string;
  setup: (m: Mutant): Promise<any>;
  run: (m: Mutant): Promise<RunnerResult>;
  cleanup: (m: Mutant, before?: any): Promise<void>;
}
```

A runner plugin describes how to run a single mutation. As such, it needs to understand how to work with the test harness used by the project. A runner plugin has the following properties:

- `name`: a unique string name
- `setup`: a function which sets up the run. In nearly every case, this function should write out the mutated source code to a file (unless you're doing something [exotic]()), but it can also do all kinds of other stuff, such as working with the `require` cache if the run is done in-process. It returns a promise, the result of which will be threaded back into the `cleanup` method.
- `run`: a function which actually executes the tests over the given mutated source file. It returns a "RunnerResult", which is essentially a Mutant with an optional `error` field.
- `cleanup`: a function which cleans up whatever side effects the `setup` and `run` functions had. Often this involves rewriting the source file to its original value. It might also operate on the `require` cache or do other sorts of housekeeping.

## Reporters
**One active**
```typescript
interface ReporterPlugin {
  name: string:
  onResult: (r: RunnerResult): void;
  onFinish: (rs: Array<RunnerResult>): void;
}
```

A reporter plugin describes how to transmit the results of running tests on mutants back to the user. A reporter plugin has the following properties:

- `name`: a unique string name
- `onResult`: a function to handle a the result of a single mutation. This is useful for printing results as they happen.
- `onFinish`: a function to handle the results of all mutations. This is particularly useful for aggregated stats, like the percentage of total mutants which are "alive" (didn't error during the run).

## Skippers
**Multiple active**
```typescript
interface SkipperPlugin {
  name: string
  skipper: (node: ESTree.Node, path: Array<string>): boolean;
}
```

A skipper plugin describes a specific type of AST node to skip entirely (including stopping recursing down it's children). Usually are for skipping spurious mutations that artificially inflate the mutation count. An example would be, if we're mutating string literals, not to mutate those which are the argument to `require` (i.e. don't mutate `require("lodash")` to `require("odash")`). In this specific case, the mistake would be caught immediately as tests start (`require()` would fail) and the mutation adds no value.



