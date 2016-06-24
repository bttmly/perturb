import * as path from "path"

import {
  GenerativeMatcherPlugin,
  GenerativeMatcher,
  PerturbConfig,
} from "../types";

// input: project/lib/dir/car.js
// output: project/test/dir/car.js

export default <GenerativeMatcherPlugin>{
  type: "generative",
  makeMatcher: function(c: PerturbConfig): GenerativeMatcher {
    return function(sourceFile: string) {
      var sourceRelPath = path.join(c.perturbRoot, c.perturbSourceDir);
      var testRelPath = path.join(c.perturbRoot, c.perturbTestDir);
      return sourceFile.replace(sourceRelPath, testRelPath);
    };
  },
};

