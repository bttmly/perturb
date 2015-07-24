"use strict";

var path = require("path");
var join = path.join;

var assign = require("object-assign");

var DEFAULT_SOURCE = "lib";
var DEFAULT_TEST = "test";
var PERTURB_DIR = ".perturb";
var DEFAULT_GLOB = "/**/*.js";

var defaultConfig = {
  rootDir: process.cwd(),
  sourceDir: DEFAULT_SOURCE,
  testDir: DEFAULT_TEST,
  sourceGlob: DEFAULT_GLOB,
  testGlob: DEFAULT_GLOB,
  pertrubDirName: PERTURB_DIR,
};

function calculateExtraConfig (config) {
  return assign({}, config, {
    originalSourceDir: join(config.rootDir, config.sourceDir),
    originalTestDir: join(config.rootDir, config.testDir),
    pertubRoot: join(config.rootDir, config.pertrubDirName),
    perturbSourceDir: join(config.perturbDirName, config.sourceDir),
    perturbTestDir: join(config.perturbDirName, config.testDir),
  });
}

// need to require a perturb-config.js file

function generateConfig (userConfig) {
  userConfig = userConfig || {};
  return Object.freeze(
    calculateExtraConfig(assign({}, userConfig, defaultConfig))
  );
}

module.exports = generateConfig;
