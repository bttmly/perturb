import path = require("path");
import { ComparativeMatcherPlugin, ComparativeMatcher, PerturbConfig } from "../types"
// matches:
//   source: project/lib/dir/file.js
//   test: project/test/dir/file.js

const plugin: ComparativeMatcherPlugin = {
  name: "comparative-matcher-plugin",
  type: "comparative",
  makeMatcher: function (c: PerturbConfig): ComparativeMatcher {
    return function (sourceFile: string, testFile: string): boolean {
      const perturbRoot = path.join(c.projectRoot, c.perturbDir);
      const sourceName = sourceFile.split(path.join(perturbRoot, c.sourceDir)).pop();
      const testName = testFile.split(path.join(perturbRoot, c.testDir)).pop();
      return sourceName === testName;
    };
  }
}

export default plugin;
