# perturb

#### pərˈtərb

verb

1.  make (someone) anxious or unsettled.
    
    _"I'm perturbed about the quality of our unit tests."_


2.  subject (a system, moving object, or process) to an influence tending to alter its normal or regular state or path.
    
    _"This module perturbs our tests to check their strength."_


## About
`perturb` provides mutation testing for JavaScript projects.

## Known Issues
Perturb is in very early development, and there are known issues.

1.) **Infinite loops** -- mutating loop constructs like `while` and `for` is tricky, given the many ways in which these loops might terminate. First and foremost, the mutation to swap `++` and `--` is currently disabled, because it will break most `for`-loops. However, infinite loops may still occur in some cases. If running `perturb` seems to hang, this is the likely culprit. Short of running tests in child processes, I don't see a way to break out of these loops. However, logging the mutation data to file before running a test would help in tracking down where these loops originate. If you hit a loop and are able to figure it out, please [open an issue]().

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

### `Result`
- **config** Config
- **matches** []Match

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
- **mutations**: `[]MutationReport`

### `MutationReport`
- **loc**: `String`: "{line},{col}"
- **name**: `MutationName`
- **passed**: `[]String`
- **failed**: `[]String`
- **diff**: `Diff`
- **source**: 

### MutationName
Enum of
-`invertConditionalTest`
-`tweakLiteralValue`
-`removeReturn`
-`dropArrayElement`
-`dropObjectProperty`
-`reverseFunctionParameters`
-`reverseFunctionParameters`
-`swapBinaryOperators`