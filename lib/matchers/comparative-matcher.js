"use strict";

var path = require("path");

/*
  source file: proj/lib/genius-algorithm.js
  test files: [
                proj/test/genius-algorithm-constructor.js
                proj/test/genius-algorithm-side-effects.js
                proj/test/genius-algorithm-some-method.js
                proj/test/genius-algorithm-another-method.js
              ]
*/

// these need a config object passed in as the first (partial application) argument

function comparativeMatcher (dir) {
  return function (sourceFile, testFile) {
    var sourceName = sourceFile.split(path.join(dir, this.sourceDir)).pop();
    var testName = testFile.split(path.join(dir, this.testDir)).pop();
    return sourceName === testName;
  };
}

module.exports = comparativeMatcher;
