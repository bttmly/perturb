import path = require("path");

// matches: 
//   source: project/lib/dir/car.js
//   test: project/test/dir/car-constructor.js
//   test: project/test/dir/car-start.js
//   test: project/test/dir/car-drive.js

function withoutExt (file) {
  return file.slice(0, -1 * path.extname(file).length);
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
