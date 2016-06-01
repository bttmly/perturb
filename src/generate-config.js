"use strict";

const assert = require("assert");
const join = require("path").join;

const assign = require("object-assign");

const getRunner = require("./runners");
const getMatcher = require("./matchers");

const DEFAULT_SOURCE = "src";
const DEFAULT_TEST = "test";
const PERTURB_DIR = ".perturb";
const DEFAULT_GLOB = "/**/*.js";

function createDefaultCacheInvalidator (config) {
  return function shouldInvalidate (modulePath) {
    // assert(isString(modulePath), "Expected a string module path");
    return modulePath.indexOf(config.perturbDirName) !== -1;
  };
}

// TODO add a configurable predicate for clearing the require.cache

const defaultConfig = {
  rootDir: process.cwd(),
  sourceDir: DEFAULT_SOURCE,
  testDir: DEFAULT_TEST,
  sourceGlob: DEFAULT_GLOB,
  testGlob: DEFAULT_GLOB,
  perturbDirName: PERTURB_DIR,
};

function calculateExtraConfig (config) {
  const newConfig = assign({}, config, {
    originalSourceDir: join(config.rootDir, config.sourceDir),
    originalTestDir: join(config.rootDir, config.testDir),
    perturbRoot: join(config.rootDir, config.perturbDirName),
    perturbSourceDir: join(config.perturbDirName, config.sourceDir),
    perturbTestDir: join(config.perturbDirName, config.testDir),
    runner: getRunner(config.runner),
  });

  if (newConfig.cacheInvalidationPredicate == null) {
    newConfig.cacheInvalidationPredicate = createDefaultCacheInvalidator(newConfig);
  }

  return newConfig;
}

// TODO need to require a perturb-config.js file

function generateConfig (userConfig) {
  userConfig = userConfig || {};

  const result = calculateExtraConfig(assign({}, defaultConfig, userConfig));

  // TODO let configuration dictate which matchers and reporters are used
  result.matcher = getMatcher("contains-comparative")(result);
  
  // result.mutantReporter = require("./reporters").mutantReporter;

  // try {
  //   const configPath = join(result.rootDir, "perturb-config");
  //   assign(result, require(configPath));
  //   console.log("loaded perturb config at", configPath);
  // } catch (err) {
  //   console.log("no perturb config file", err);
  // }

  return result;
}

module.exports = generateConfig;
