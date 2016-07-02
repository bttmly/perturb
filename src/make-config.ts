const assign = require("object-assign");
const fs = require("fs");

import { PerturbConfig } from "./types";

const CONFIG_FILE_NAME = ".perturbrc";

const defaultConfig: PerturbConfig = {
  projectRoot: process.cwd(),
  testDir: "test",
  sourceDir: "src",
  perturbDir: ".perturb",

  sourceGlob: "/**/*.js",
  testGlob: "/**/*.js",

  mutators: [],
  skippers: [],
  reporter: "diff",
  matcher: "contains-comparative",
  runner: "mocha",
}

module.exports = function makeConfig (userConfig = {}): PerturbConfig {
  let fileConfig;

  try {
    let str = fs.readFileSync(`${process.cwd()}/${CONFIG_FILE_NAME}`).toString();
    fileConfig = JSON.parse(str);
  } catch (err) {
    console.log("No config file present");
    fileConfig = {};
  }

  return <PerturbConfig>assign({}, defaultConfig, fileConfig, userConfig);
}
