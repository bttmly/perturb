///<reference path="../perturb.d.ts" />

import path = require("path");

// input: project/lib/dir/car.js
// output: project/test/dir/car.js

export = <GenerativeMatcherPlugin>{
  type: "generative",
  makeMatcher: function(c: PerturbConfig): GenerativeMatcher {
    return function(sourceFile: string) {
      const perturbRoot = path.join(c.projectRoot, c.perturbDir);
      const perturbSourceDir = path.join(perturbRoot, c.sourceDir);
      const perturbTestDir = path.join(perturbRoot, c.testDir);
      return sourceFile.replace(perturbSourceDir, perturbTestDir);
    };
  },
};

