"use strict";

var fs = require("fs-extra");
var join = require("path").join;
var glob = require("glob");
var mapMirror = require("./util/map-mirror");

function setupPerturbDirectory (config) {
  var originalRootDir = config.rootDir;
  var originalSource = join(config.rootDir, config.sourceDir);
  var originalTest = join(config.rootDir, config.testDir);

  var perturbRootDir = join(originalRootDir, config.pertrubDirName);
  var perturbSourceDir = join(perturbRootDir, config.sourceDir);
  var perturbTestDir = join(perturbRootDir, config.testDir);

  config.matcher = config.matcher2.bind(config);

  var shouldSymlink = mapMirror([
    "node_modules",
  ]);

  // maybe remove this? if it exists, it indicates that cleanup is broken
  fs.removeSync(perturbRootDir);

  fs.mkdirSync(perturbRootDir);
  fs.copySync(originalSource, perturbSourceDir);
  fs.copySync(originalTest, perturbTestDir);

  fs.readdirSync(originalRootDir).forEach(function (item) {
    if (item in shouldSymlink) {
      fs.symlinkSync(join(originalRootDir, item), join(perturbRootDir, item));
    }
  });
}

function teardownPerturbDirectory (config) {
  fs.removeSync(config.perturbDir);
}

function getFilePaths (config) {
  return {
    sources: glob.sync(config.perturbRoot + config.sourceGlob),
    tests: glob.sync(config.perturbRoot + config.testGlob),
  };
}

module.exports = {
  setupPerturbDirectory: setupPerturbDirectory,
  teardownPerturbDirectory: teardownPerturbDirectory,
  getFilePaths: getFilePaths,
};
