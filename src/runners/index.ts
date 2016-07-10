import { RunnerPlugin } from "../types";

const plugins = new Map<string, RunnerPlugin>()

;[
  require("./mocha"),
  require("./mocha-child-process"),
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

module.exports = function get (name: string): RunnerPlugin {
  const plugin = plugins.get(name);
  if (plugin == null) {
    throw new Error(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
  }
  return plugin;
}

