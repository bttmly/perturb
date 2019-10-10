import diffReporter from "./diff";
import nameReporter from "./name";
import quietReporter from "./quiet";

import { ReporterPlugin } from "../types";

const plugins = new Map<string, ReporterPlugin>([
  [diffReporter.name, diffReporter],
  [nameReporter.name, nameReporter],
  [quietReporter.name, quietReporter],
]);

export default function get(input: string | ReporterPlugin): ReporterPlugin {
  if (typeof input !== "string") {
    return input;
  }

  if (plugins.has(input)) return plugins.get(input)!;

  try {
    return require(`perturb-plugin-reporter-${input}`);
  } catch (e) {
    throw new Error(
      `unable to locate -REPORTER- plugin "${input}" -- fatal error, exiting`,
    );
  }
}
