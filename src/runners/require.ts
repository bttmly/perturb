import runnerUtils = require("./utils");

export = <RunnerPlugin>{
  name: "require",
  setup (m: Mutant) {
    runnerUtils.clearRequireCache();
    runnerUtils.writeMutatedCode(m);
    return Promise.resolve();
  },
  run (m: Mutant) {
    try {
      m.testFiles.forEach(f => {
        console.log("requiring", f, "...");
        require(f)
      });
    } catch (error) {
      console.log(error.message);
      return Promise.resolve(Object.assign({}, m, { error }));
    }
    return Promise.resolve(Object.assign({}, m, { error: null }));
  },
  cleanup (m: Mutant) {
    runnerUtils.restoreOriginalCode(m);
    return Promise.resolve();
  },
}
