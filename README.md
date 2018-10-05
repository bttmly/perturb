# perturb [![Build Status](https://travis-ci.com/bttmly/perturb.svg?branch=master)](https://travis-ci.com/bttmly/perturb) [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

#### [pərˈtərb](https://www.google.com/#safe=on&q=define+perturb)

verb

1.  make (someone) anxious or unsettled.
    
    _"I'm perturbed about the quality of our unit tests."_


2.  subject (a system, moving object, or process) to an influence tending to alter its normal or regular state or path.
    
    _"This library perturbs our source code to check unit test strength."_


## Installation

_For global command line use_

`npm i -g perturb`

_Within a project for programmatic use or for `package.json` scripts_

`npm i perturb`

## About
`perturb` is a mutation testing framework for JavaScript projects. It helps determine the quality of unit tests.

> "Mutation testing is used to design new software tests and evaluate the quality of existing software tests. Mutation testing involves modifying a program in small ways." 
[Source](http://en.wikipedia.org/wiki/Mutation_testing)

Perturb takes your source code, parses the [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree), generates mutations, and runs your test suite against them. If all your tests pass when run against a mutant, you probably missed a test.

Mutation testing is different from and generally more comprehensive than code coverage metrics. Unit tests are one way way of specifying the behavior of software. If a mutation is not covered by a unit test, then that aspect of the program is unspecified. 

## Stability Disclaimer
This project is in rapid development, and should be considered _experimental_. It "works" -- sort of. This repository contains two working examples. First, I pulled in the Node.js core `EventEmitter` library plus its associated tests. If you clone the library and run `make example-events` you'll note that the unit tests on that library have a lot of blind spots (308 mutations covered of 466 total as of this writing). Second, you can run `make dogfood` to run `perturb` on it's own source code. Frankly, the actual test coverage of this library is pretty poor, and it's still riddled with bugs. 

## Usage
At this very moment, the library is basically unusable, since it's npm installation is broken. Cloning it and running it directly should (mostly) work.

This library is intended (eventually) to be used primarily by the command line. However, the exiting CLI modules are badly out of date with the core library, so you need to call the library directly. Luckily this is pretty easy -- the CLI will just provide an interface for constructing the root configuration object, which is all the main `perturb` function needs.

```js
const perturb = require("perturb");
cosnt config = { /* ... */ };
perturb(config).then(function (results) {
  // ...
});
```

Configuration parameters will be documented (eventually), but there is enough to get going in `script/run.js` and `src/make-config.ts`. The trickiest thing will be figuring out how to get `perturb` to correctly match up a source file with it's test file(s). The simplest possible arrangement is a single directory with all the source files and another single directory with all the test files, where their internal structure mirrors one another. This library's tests are written that way. If your code fits that pattern it should be relatively simple to get up and running. More advanced matching patterns are available, but aren't documented at this point.
