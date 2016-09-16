import diffReporter = require("./diff");
import nameReporter = require("./name");

const plugins = new Map<string, ReporterPlugin>([
  [ diffReporter.name, diffReporter ],
  [ nameReporter.name, nameReporter ],
]);

export = function get (input: string | ReporterPlugin): ReporterPlugin {
  if (typeof input !== "string") {
    return input;
  }

  const str = <string>input;
  if (plugins.has(str)) return <ReporterPlugin>plugins.get(str);

  try {
    return require(`perturb-plugin-reporter-${str}`);
  } catch (e) {
    throw new Error(`unable to locate -REPORTER- plugin "${str}" -- fatal error, exiting`);
  }
}
