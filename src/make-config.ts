import * as fs from "fs";
import { PerturbConfig, OptionalPerturbConfig } from "./types";

const CONFIG_FILE_NAME = ".perturbrc";
const DEFAULT_RUNNER = "mocha";
const DEFAULT_MATCHER = "contains-comparative";

const defaultConfig: PerturbConfig = {
  testCmd: "npm test",

  projectRoot: process.cwd(),
  testDir: "test",
  sourceDir: "lib",
  perturbDir: ".perturb",

  sourceGlob: "/**/*.js",
  testGlob: "/**/*.js",

  mutators: [],
  skippers: [],
  reporter: "diff",
  matcher: DEFAULT_MATCHER,
  runner: DEFAULT_RUNNER,

  killRateMin: 0,
};

export default function makeConfig(userConfig: OptionalPerturbConfig = {}): PerturbConfig {
  let fileConfig;

  // TODO: implicit config cascading from the file system could be really confusing.
  // perhaps remove it? or push it further up the stack so its exposed as a CLI argument

  try {
    const str = fs
      .readFileSync(`${process.cwd()}/${CONFIG_FILE_NAME}`, "utf8");
    fileConfig = JSON.parse(str);
  } catch (err) {
    console.log("No config file present");
    fileConfig = {};
  }

  const cfg: PerturbConfig = Object.assign(
    {},
    defaultConfig,
    fileConfig,
    userConfig,
  );

  // TODO -- we need to validate shape here because we're reading potentially busted
  // stuff from the CLI or the file system and downstream everything assumes this is
  // well-formed

  return cfg;
}
