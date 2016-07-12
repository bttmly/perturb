# perturb [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

#### [pərˈtərb](https://www.google.com/#safe=on&q=define+perturb)

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


