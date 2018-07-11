import MochaRunner from "./mocha";
import RequireRunner from "./require";
import ForkRunner from "./fork";
import { RunnerPluginConstructor } from "../types";

const plugins = new Map<string, RunnerPluginConstructor>([
  [ "mocha", MochaRunner ],
  [ "require", RequireRunner ],
  [ "fork", ForkRunner ],
]);

// since we only accept a single runner plugin, there's no compelling reason to provide
// a hook for injecting them at runtime. If you want to use a custom one, pass it directly.
export default function get(input: string | RunnerPluginConstructor): RunnerPluginConstructor {
  if (typeof input !== "string") {
    return input;
  }

  if (plugins.has(input)) {
    return plugins.get(input)!;
  }

  try {
    return require(`perturb-plugin-runner-${input}`);
  } catch (e) {
    throw new Error(
      `unable to locate -RUNNER- plugin "${input}" -- fatal error, exiting`,
    );
  }
}
