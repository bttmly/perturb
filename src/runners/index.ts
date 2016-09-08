import mochaRunner = require("./mocha");
import requireRunner = require("./require");
import forkRunner = require("./fork");

const plugins = new Map<string, RunnerPlugin>([
  [ mochaRunner.name, mochaRunner ],
  [ requireRunner.name, requireRunner ],
  [ forkRunner.name, forkRunner ],
]);

// function injectPlugin (name) {
//   let plugin: RunnerPlugin;
//   try {
//     plugin = require(`perturb-plugin-runner-${name}`);
//     plugins.set(name, plugin);
//     return;
//   } catch (err) {
//     // any way to recover? other locate strategy?
//     console.log(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
//     throw err;
//   }
// }

export = function get (input: string | RunnerPlugin): RunnerPlugin {
  if (typeof input === "string") {
    const runner = plugins.get(input);
    if (runner == null) {
      throw new Error(`unable to locate -RUNNER- plugin "${input}" -- fatal error, exiting`);
    }
    return runner;
  } else {
    return input;
  }
}

