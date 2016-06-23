import { ReporterPlugin } from "../types";

const diffReporter = require("./mocha");

const plugins = new Map<ReporterPlugin>([
  [ "diff", diffReporter ],
]);

export function locateReporterPlugins (names) {
  names.forEach(function (name) {
    let plugin: ReporterPlugin;
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

export default function get (name: string): ReporterPlugin {
  const p = plugins.get(name);
  if (p == null) {
    throw new Error(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
  }
  return p;
}

