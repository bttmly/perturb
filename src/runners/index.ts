import mochaRunner = require("./mocha");
import requireRunner = require("./require");
import forkRunner = require("./fork");

const plugins = new Map<string, RunnerPlugin>([
  [ mochaRunner.name, mochaRunner ],
  [ requireRunner.name, requireRunner ],
  [ forkRunner.name, forkRunner ],
]);

// since we only accept a single runner plugin, there's no compelling reason to provide
// a hook for injecting them at runtime. If you want to use a custom one, pass it directly.
export = function get (input: string | RunnerPlugin): RunnerPlugin {
  if (typeof input !== "string") {
    return input;
  }

  const str = <string>input;
  if (plugins.has(str)) return <RunnerPlugin>plugins.get(str);

  try {
    return require(`perturb-plugin-runner-${str}`);
  } catch (e) {
    throw new Error(`unable to locate -RUNNER- plugin "${str}" -- fatal error, exiting`);
  }
}

