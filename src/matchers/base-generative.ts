import * as path from "path";
import {
  GenerativeMatcherPlugin,
  GenerativeMatcher,
  PerturbConfig,
} from "../types";

// input: project/lib/dir/car.js
// output: project/test/dir/car.js

const plugin: GenerativeMatcherPlugin = {
  type: "matcher",
  name: "generative-matcher-plugin",
  matchType: "generative",
  makeMatcher(c: PerturbConfig): GenerativeMatcher {
    return (sourceFile: string) => {
      const perturbRoot = path.join(c.projectRoot, c.perturbDir);
      const perturbSourceDir = path.join(perturbRoot, c.sourceDir);
      const perturbTestDir = path.join(perturbRoot, c.testDir);
      return sourceFile.replace(perturbSourceDir, perturbTestDir);
    };
  },
};

export default plugin;
