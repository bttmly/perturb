import path = require("path");

// matches:
//   source: project/lib/xyz/car.js
//   test: project/test/xyz/car-constructor.js
//   test: project/test/xyz/car-start.js
//   test: project/test/xyz/car-drive.js

function withoutExt (fileName) {
  return fileName.slice(0, -1 * path.extname(fileName).length);
}

export = <ComparativeMatcherPlugin>{
  type: "comparative",
  makeMatcher: function(c: PerturbConfig): ComparativeMatcher {
    return function(sourceFile: string, testFile: string): boolean {
      const perturbRoot = path.join(c.projectRoot, c.perturbDir);
      const perturbSourceDir = path.join(perturbRoot, c.sourceDir);
      const perturbTestDir = path.join(perturbRoot, c.testDir);

      const sourceName = withoutExt(sourceFile.split(perturbSourceDir).pop());
      const testName = withoutExt(testFile.split(perturbTestDir).pop());
      return testName.slice(0, sourceName.length) === sourceName;
    };
  }
}
