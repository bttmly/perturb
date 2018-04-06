import * as runnerUtils from "./utils";
import { RunnerPlugin, Mutant } from "../types";

const plugin: RunnerPlugin = {
  name: "require",
  async setup(m: Mutant) {
    runnerUtils.clearRequireCache();
    runnerUtils.writeMutatedCode(m);
  },
  async run(m: Mutant) {
    try {
      m.testFiles.forEach(f => require(f));
    } catch (error) {
      console.log(error.message);
      return Object.assign({}, m, { error });
    }
    return Object.assign({}, m, { error: null });
  },
  async cleanup(m: Mutant) {
    runnerUtils.restoreOriginalCode(m);
  },
};

export default plugin;
