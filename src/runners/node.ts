import runnerUtils = require("./utils");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

export = <RunnerPlugin>{
  name: "node",
  setup (m: Mutant) {
    runnerUtils.clearRequireCache();
    runnerUtils.writeMutatedCode(m);
    return Promise.resolve();
  },
  run (m: Mutant) {
    try {
      m.testFiles.map(f => {
        console.log("about to require", f);
        require(f) 
      });
    } catch (error) {
      return Promise.resolve(Object.assign({}, m, { error }));
    }
    return Promise.resolve(Object.assign({}, m, { error: null }));
  },
  cleanup (m: Mutant) {
    runnerUtils.restoreOriginalCode(m);
    return Promise.resolve();
  },
}
