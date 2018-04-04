import * as path from "path"
import { ComparativeMatcherPlugin, ComparativeMatcher, PerturbConfig } from "../types"

// matches:
//   source: project/lib/xyz/car.js
//   test: project/test/xyz/car-constructor.js
//   test: project/test/xyz/car-start.js
//   test: project/test/xyz/car-drive.js

function withoutExt (fileName: string) {
  return fileName.slice(0, -1 * path.extname(fileName).length);
}

const plugin: ComparativeMatcherPlugin = {
  name: "contains-comparative-matcher-plugin",
  type: "comparative",
  makeMatcher: function(c: PerturbConfig): ComparativeMatcher {
    return function(sourceFile: string, testFile: string): boolean {
      const perturbRoot = path.join(c.projectRoot, c.perturbDir);
      const perturbSourceDir = path.join(perturbRoot, c.sourceDir);
      const perturbTestDir = path.join(perturbRoot, c.testDir);

      // TODO: lose the "!"s
      const sourceName = withoutExt(sourceFile.split(perturbSourceDir).pop()!);
      const testName = withoutExt(testFile.split(perturbTestDir).pop()!);
      return testName.slice(0, sourceName.length) === sourceName;
    };
  }
}

export default plugin