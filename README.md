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
  testGlob: "/**/*.j",
  tempTest: ".perturb-test",
  tempSource: ".perturb-source",
  reporter: defaultReporter,
  matcher: function (sourceFile) 
    return sourceFile.replace(".js", "-test.js");
  }
};
```

## Interfaces

### `Config`
- **sharedParent**: `String`
- **sourceDir**: `String`
- **sourceGlob**: `String`
- **sourceTemp**: `String`
- **testDir**: `String`
- **testGlob**: `String`
- **testTemp**: `String`
- **reporter**: `Function<Array[Report report]>`
- **matcher**: `Function<String sourcePath, String testPath>`
- **matches**: `Array[Match match]`

### `Match`

### `Report`
