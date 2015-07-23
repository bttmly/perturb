"use strict";

var path = require("path");

function generativeMatcher (dir) {
  return function (sourceFile) {
    var sourceRelPath = path.join(dir, this.sourceDir);
    var testRelPath = path.join(dir, this.testDir);
    return sourceFile.replace(sourceRelPath, testRelPath);
  };
}

module.exports = generativeMatcher;
