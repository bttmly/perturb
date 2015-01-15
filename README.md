# perturb

#### pərˈtərb

verb

1.  make (someone) anxious or unsettled.
    
    _"I'm perturbed about the quality of our unit tests."_


2.  subject (a system, moving object, or process) to an influence tending to alter its normal or regular state or path.
    
    _"This module perturbs our tests to check their strength."_


## About
`perturb` provides mutation testing for JavaScript projects.


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

## Interfaces

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
- **reporter**: `Function<Array[MutationReport report]>`
- **matcher**: `Function<String sourcePath, String testPath>`

### `Match`
- **sourceFile**: `String`
- **testFile**: `String`
- **mutations**: `[]MutationReport`

### `MutationReport`
- **loc**: `String`
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