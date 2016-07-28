import runnerUtils = require("./utils");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

export = <RunnerPlugin>{
  name: "node",
  setup (m: Mutant) {
    runnerUtils.writeMutatedCode(m);
    return Promise.resolve();
  },
  run (m: Mutant) {
    return Promise.resolve(require(m.sourceFile))
      .then(() => Object.assign({}, m, { error: null }))
      .catch(error => Object.assign({}, m, { error }));
  },
  cleanup (m: Mutant) {
    runnerUtils.restoreOriginalCode(m);
    return Promise.resolve();
  },
}
