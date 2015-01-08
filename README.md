# perturb
_Functional mutation testing for JavaScript_

### per·turb
#### pərˈtərb

verb

1 make (someone) anxious or unsettled.
  "I'm perturbed about the quality of our unit tests."

2 subject (a system, moving object, or process) to an influence tending to alter its normal or regular state or path.
  "This module perturbs our tests to check their strenght."




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
