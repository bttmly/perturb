"use strict";

var fs = require("fs-extra");
var join = require("path").join;
var glob = require("glob");
var mapMirror = require("./util/map-mirror");

function setupPerturbDirectory (config) {

  var shouldSymlink = {
    "node_modules": "node_modules",
  };

  // maybe remove this? if it exists it means there is a bug with cleanup
  fs.removeSync(config.perturbRoot);

  fs.mkdirSync(config.perturbRoot);
  fs.copySync(config.originalSourceDir, config.perturbSourceDir);
  fs.copySync(config.originalTestDir, config.perturbTestDir);

  fs.readdirSync(config.rootDir).forEach(function (item) {
    if (item in shouldSymlink) {
      fs.symlinkSync(join(config.rootDir, item), join(config.perturbRoot, item));
    }
  });
}

function teardownPerturbDirectory (config) {
  fs.removeSync(config.perturbRoot);
}

function getFilePaths (config) {
  return {
    sources: glob.sync(config.perturbRoot + config.sourceGlob),
    tests: glob.sync(config.perturbRoot + config.testGlob),
  };
}

module.exports = {
  setup: setupPerturbDirectory,
  teardown: teardownPerturbDirectory,
  getFilePaths: getFilePaths,
};
