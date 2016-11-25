import fs = require("fs");

const assign = require("object-assign");

const CONFIG_FILE_NAME = ".perturbrc";
const DEFAULT_RUNNER = "mocha";
const DEFAULT_MATCHER = "contains-comparative";

const defaultConfig: PerturbConfig = {
  testCmd: "npm test",

  projectRoot: process.cwd(),
  testDir: "test",
  sourceDir: "src",
  perturbDir: ".perturb",

  sourceGlob: "/**/*.js",
  testGlob: "/**/*.js",

  mutators: [],
  skippers: [],
  reporter: "diff",
  matcher: DEFAULT_MATCHER,
  runner: DEFAULT_RUNNER,
}

function makeConfig (userConfig = {}): PerturbConfig {
  let fileConfig;

  try {
    let str = fs.readFileSync(`${process.cwd()}/${CONFIG_FILE_NAME}`).toString();
    fileConfig = JSON.parse(str);
  } catch (err) {
    console.log("No config file present");
    fileConfig = {};
  }

  const cfg = <PerturbConfig>assign({}, defaultConfig, fileConfig, userConfig);

  // TODO -- validate shape here?

  return cfg;
}

export = makeConfig;
