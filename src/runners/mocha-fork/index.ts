import { 
  RunnerPlugin,
  RunnerResult,
  Mutant,
  RunnerPluginCtor
} from "../../types";

if (process.send) {
  // we're in the child process...
  const mutant: Mutant = JSON.parse(process.argv[2]);
  const MochaRunner: RunnerPluginCtor = require("../mocha");
  const runner: RunnerPlugin = new MochaRunner(mutant);
  let result: RunnerResult;
  Promise.resolve()
    .then(() => runner.setup())
    .then(() => runner.run())
    .then(_result => result = _result)
    .then(() => runner.cleanup())
    .then(function () {
      process.send(JSON.stringify({
        error: fixError(result.error)
      }));
    });

} else {
  // we're in the parent process...
  module.exports = require("./parent");
}

// ensure we can serialize it properly
function fixError (err) {
  if (err == null) {
    return undefined;
  }

  Object.defineProperties(err, {
    stack: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: err.stack,
    },
    message: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: err.message,
    }
  });
  return err;
}
