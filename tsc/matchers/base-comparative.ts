import * as path from "path"

import {
  ComparativeMatcherPlugin,
  ComparativeMatcher,
  PerturbConfig,
} from "../types";

// matches: 
//   source: project/lib/dir/file.js
//   test: project/test/dir/file.js

export default <ComparativeMatcherPlugin>{
  type: "comparative",
  makeMatcher: function (c: PerturbConfig): ComparativeMatcher {
    return function (sourceFile: string, testFile: string): boolean {
      var sourceName = sourceFile.split(path.join(c.perturbRoot, c.perturbSourceDir)).pop();
      var testName = testFile.split(path.join(c.perturbRoot, c.perturbTestDir)).pop();
      return sourceName === testName;
    };
  }
}
