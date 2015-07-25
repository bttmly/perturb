"use strict";

var assert = require("assert");
var join = require("path").join;

var assign = require("object-assign");

var isString = require("./util/is-string");

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
  perturbDirName: PERTURB_DIR,
};

function calculateExtraConfig (config) {
  return assign({}, config, {
    originalSourceDir: join(config.rootDir, config.sourceDir),
    originalTestDir: join(config.rootDir, config.testDir),
    perturbRoot: join(config.rootDir, config.perturbDirName),
    perturbSourceDir: join(config.perturbDirName, config.sourceDir),
    perturbTestDir: join(config.perturbDirName, config.testDir),
  });
}

// need to require a perturb-config.js file

function generate (userConfig) {
  userConfig = userConfig || {};
  var result = calculateExtraConfig(assign({}, userConfig, defaultConfig));

  // TODO let configuration dictate which matchers and reporters are used
  result.matcher = require("./matchers/comparative-matcher")(result);
  result.mutantReporter = require("./reporters").mutantReporter;
  return result;
  // );
}

function validate (config) {
  [
    "rootDir",
    "sourceDir",
    "testDir",
    "sourceGlob",
    "testGlob",
    "perturbDirName",
    "originalSourceDir",
    "originalTestDir",
    "perturbRoot",
    "perturbSourceDir",
    "perturbTestDir",
  ].forEach(function (key) {
    assert(isString(config[key]), key + " must be a string");
  });
}

module.exports = {
  generate: generate,
  validate: validate,
};
