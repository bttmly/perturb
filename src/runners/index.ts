import { RunnerPlugin } from "../types";

const plugins = new Map<string, RunnerPlugin>()

;[
  require("./mocha"),
  require("./mocha-fork"),
  require("./node"),
].forEach(function (runner) {
  plugins.set(runner.name, runner);
});

function injectPlugins (names) {
  names.forEach(function (name) {
    let plugin: RunnerPlugin;
    try {
      plugin = require(`perturb-plugin-runner-${name}`);
      plugins.set(name, plugin);
      return;
    } catch (err) {
      // any way to recover? other locate strategy?
      console.log(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
      throw err;
    }
  });
}

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

