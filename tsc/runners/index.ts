import { RunnerPlugin } = "../types";

const mochaRunner = require("./mocha");

const builtIns = new Map<RunnerPlugin>([
  [ "mocha", mochaRunner ],
]);

export function locateRunnerPlugins (names) {
  names.forEach(function (name) {
    let plugin: RunnerPlugin;
    try {
      plugin = require(`perturb-plugin-runner-${name}`);
      builtIns.set(name, plugin);
      return;
    } catch (err) {
      // any way to recover? other locate strategy?
      console.log(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
      throw err;
    }
  });
}

export default function get (name: string): RunnerPlugin {
  const plugin = RunnerPlugin.get(name);
  if (plugin == null) {
    throw new Error(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
  }
  return plugin;
}

