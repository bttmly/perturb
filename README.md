# perturb [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

#### pərˈtərb

verb

1.  make (someone) anxious or unsettled.
    
    _"I'm perturbed about the quality of our unit tests."_


2.  subject (a system, moving object, or process) to an influence tending to alter its normal or regular state or path.
    
    _"This module perturbs our source code to check unit test strength."_


## Installation

_For global command line use_

`npm i -g perturb`

_Within a project for programmatic use or for `package.json` scripts_

`npm i perturb`

## About
`perturb` is a mutation testing framework for JavaScript projects. It helps determine the quality of unit tests.

> "Mutation testing is used to design new software tests and evaluate the quality of existing software tests. Mutation testing involves modifying a program in small ways." 
[Source](http://en.wikipedia.org/wiki/Mutation_testing)

Perturb takes your source code, parses the [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree), generates mutations, and runs your test suite against them. If all your tests pass when run against a mutant, you probably missed a test. It is currently optimized for projects in which there is a 1:1 correlation between source and test files.

Mutation testing is different from and generally more comprehensive than code coverage metrics. Unit tests are one way way of specifying the behavior of software. If a mutation is not covered by a unit test, then that aspect of the program is unspecified. 

## Stability Disclaimer
This project is in very early development, and should be considered _experimental_. It "works", but there are a ton of issues to address and core features to add. The configuration API (the only public interface to `perturb`) is subject to breaking changes. Any and all ideas, suggestions, contributions welcome. Just open an [issue](https://github.com/nickb1080/perturb/issues) or a [pull request](https://github.com/nickb1080/perturb/pulls).

## Compile-to-JS Languages
I interested in eventually providing an entry point for extensions which mutate compile-to-JS languages like CoffeeScript. You can of course already compile your code to JavaScript and then mutate it, but it will be difficult to track down exactly what mutations aren't satisfied. Any contributions in this area are very welcome.

## Known Issues
1.) **Mocha only** -- Perturb only supports Mocha as a test runner at this point. PRs welcome for adding other test runners. I plan to add support for [tap](http://testanything.org/)-[compliant](https://github.com/isaacs/node-tap)  [harnesses](https://github.com/substack/tape) eventually. If you want another test runner, open an issue, or better, yet a PR.

2.) **Infinite loops** -- mutating loop constructs like `while` and `for` is tricky, given the many ways in which these loops might terminate. First and foremost, the mutation to swap `++` and `--` is currently disabled, because it will break most `for`-loops. However, infinite loops may still occur in some cases. If running `perturb` seems to hang, this is the likely culprit. Luckily, hard synchronous loops are somewhat rare; blowing the call stack with bad recursion is probably a more likely mutation result, and that'll should just throw. If you hit a loop and are able to figure it out, please [open an issue](https://github.com/nickb1080/perturb/issues). One potential fix for this is to run each mutant in a child process, killing the process if it hangs for a certain duration. It's not clear that the complexity and (probable) performance hit would be worth it for a case which, so far, seems fairly rare.

3.) **Equivalent mutations** -- there may be mutations that are functionally identical. For instance, given this source code:

```js
if (nextValue === value) {
  // ...
}
```

We will generate two functionally identical mutants:

```js
// invert conditional test
if (!(nextValue === value)) {
  // ...
}

// swap binary operators
if (nextValue !== value) {
  // ...
}
```

This could skew metrics on kill rate since a single fix will kill both mutants. That said, it doesn't seem like a real problem so far.

## API
```js
// default config
{
  sharedParent: process.cwd(),
  sourceDir: "lib",
  testDir: "test",
  sourceGlob: "/**/*.js",
  testGlob: "/**/*.js",
  tempTest: ".perturb-test",
  tempSource: ".perturb-source",
  reporter: defaultReporter,
  matcher: function (sourceFile) 
    return sourceFile.replace(".js", "-test.js");
  }
};
```

## CLI
You can pass in any of the configuration parameters that are strings through the command line interface.

`perturb --testGlob '/**/*-test.js' --testDir 'test-unit'"`

## Interfaces
Various configuration parameters allow you to pass in functions which will interact with internal data representations. They are documented here in [IDL](https://heycam.github.io/webidl/)

### `PerturbReport`
```idl
interface PerturbReport {
  attribute Metadata metadata;
  attribute Config config;
  attribute matches []Match;
}
```

### `Meta`
```idl
interface Metadata {
  attribute boolean errored;
  attribute number duration;
  attribute number matchCount;
  attribute number mutantCount;
  attribute number mutantKillCount;
  attribute number killRate;
}
```

### `Config`


```idl
interface Config {
  attribute string sharedParent;
  attribute string sourceDir;
  attribute string sourceGlob;
  attribute string sourceTemp;
  attribute string testDir;
  attribute string testGlob;
  attribute string testTemp;
  void matchReporter(Match match);
  void mutantReporter(Mutant mutant);
  void summaryReporter(Meta meta);
}
```

### `Match`
```idl
interface Match {
  attribute string sourceFile
  attribute string testFile
  attribute []MutantReport mutants
}
```

### `MutantReport`
```idl
interface MutantReport {
  attribute string loc
  attribute MutantName name
  attribute Diff diff
  attribute String source
  attribute []String passed
  attribute []String failed
}
```

### `MutantName`
```idl
enum MutantName {
  "invertConditionalTest",
  "reverseFunctionParameters",
  "dropReturn",
  "dropThrow",
  "dropArrayElement",
  "dropObjectProperty",
  "tweakLiteralValue",
  "swapLogicalOperators",
  "swapBinaryOperators",
  "dropUnaryOperator",
  "dropMemberAssignment"
}
```

### FAQ

## Todo
- [x] Skip classes of mutations via settings / cmd line args
- [ ] Skip mutation API via comments (or something else?) a la `jshint`
- [ ] Targeted mutations of code fitting common patterns (particularly "classes")
- [ ] .perturbrc
- [ ] TAP runner
