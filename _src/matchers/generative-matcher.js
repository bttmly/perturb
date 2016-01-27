"use strict";

var path = require("path");

function createGenerativeMatcher (config) {
  return function generativeMatcher (sourceFile) {
    var sourceRelPath = path.join(config.pertrubDir, config.sourceDir);
    var testRelPath = path.join(config.pertrubDir, config.testDir);
    return sourceFile.replace(sourceRelPath, testRelPath);
  };
}

module.exports = createGenerativeMatcher;
