import { RunnerPlugin } from "../types";
import mochaRunner from "./mocha";

const plugins = new Map<string, RunnerPlugin>([
  [ "mocha", mochaRunner ],
]);

export function injectPlugins (names) {
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

export default function get (name: string): RunnerPlugin {
  const plugin = plugins.get(name);
  if (plugin == null) {
    throw new Error(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
  }
  return plugin;
}

