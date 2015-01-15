# perturb [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

#### pərˈtərb

verb

1.  make (someone) anxious or unsettled.
    
    _"I'm perturbed about the quality of our unit tests."_


2.  subject (a system, moving object, or process) to an influence tending to alter its normal or regular state or path.
    
    _"This module perturbs our tests to check their strength."_


## Installation

_For global command line use_

`npm i -g perturb`

_Within a project for programmatic use or for `package.json` scripts_

`npm i -S perturb`

## About
`perturb` is a mutation testing framework for JavaScript projects, helping you ensure the quality of your tests.

"Mutation testing is used to design new software tests and evaluate the quality of existing software tests. Mutation testing involves modifying a program in small ways." 

- [Wikipedia](http://en.wikipedia.org/wiki/Mutation_testing)

Perturb takes your source code, parses the [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree), generates mutations, and runs your test suite against them. If all your tests pass when run against a mutant, you probably missed a test. It is currently optimized for projects in which there is a 1:1 correlation between source and test files.

Mutation testing is different from and generally more comprehensive than code coverage metrics.Unit tests are one way way of specifying the behavior of software. If a mutation is not covered by a unit test, then that aspect of the program is unspecified. 

## Stability Disclaimer
This project is in very early development, and should be considered _experimental_. It "works", but there are a ton of issues to address and core features to add. The configuration API (the only public interface to `perturb`) is subject to breaking changes. Any and all ideas, suggestions, contributions welcome. Just open an [issue]() or a [pull request]().

## Known Issues
1.) **Mocha only** -- Perturb only supports Mocha as a test runner at this point. PRs welcome for adding other test runners. I plan to add support for [tap](http://testanything.org/)-[compliant](https://github.com/isaacs/node-tap) [harnesses](git@github.com:substack/tape.git) eventually. If you want another test runner, open an issue, or better, yet a PR.

2.) **Infinite loops** -- mutating loop constructs like `while` and `for` is tricky, given the many ways in which these loops might terminate. First and foremost, the mutation to swap `++` and `--` is currently disabled, because it will break most `for`-loops. However, infinite loops may still occur in some cases. If running `perturb` seems to hang, this is the likely culprit. Short of running tests in child processes, I don't see a reasonable way to break out of these loops. However, logging the mutation data to file before running a test would help in tracking down where these loops originate. If you hit a loop and are able to figure it out, please [open an issue]().


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
Various configuration parameters allow you to pass in functions which will interact with internal data representations. The schema for each is as follows:

### `PerturbReport`
- **metadata**: `Meta`
- **config**: `Config`
- **matches**: `[]Match`

### `Meta`
- **startedAt**: `Date`
- **endedAt**: `Date`
- **duration**: `Number`
- **matchCount**: `Number`
- **errored**: `Boolean`
- **mutantCount**: `Number`
- **mutantKillCount**: `Number`
- **killRate**: `Number`

### `Config`
- **sharedParent**: `String`
- **sourceDir**: `String`
- **sourceGlob**: `String`
- **sourceTemp**: `String`
- **testDir**: `String`
- **testGlob**: `String`
- **testTemp**: `String`
- **reporter**: `Function<[]MutationReport reports>`
- **matcher**: `Function<String sourcePath, String testPath>`

### `Match`
- **sourceFile**: `String`
- **testFile**: `String`
- **mutants**: `[]MutantReport`

### `MutantReport`
- **loc**: `String`: "{line},{col}"
- **name**: `MutantName`
- **passed**: `[]String`
- **failed**: `[]String`
- **diff**: `Diff`
- **source**: 

### `MutantName`
Enum of
- `invertConditionalTest`
- `tweakLiteralValue`
- `removeReturn`
- `dropArrayElement`
- `dropObjectProperty`
- `reverseFunctionParameters`
- `reverseFunctionParameters`
- `swapLogicalOperators`
- `swapBinaryOperators`

## Todo
- [ ] Preemtive mutant logging to provide insight when perturb hangs or otherwise misbehaves.
- [ ] Skip mutation API via comments (or something else?) a la `jshint`
- [ ] Ability to progressively report status/output (rather than as a block on complete)
