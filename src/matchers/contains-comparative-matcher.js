"use strict";

var path = require("path");

function withoutExt (file) {
  return file.slice(0, -1 * path.extname(file).length);
}

/*
  source file: proj/lib/genius-algorithm.js
  matching files: [
                proj/test/genius-algorithm-constructor.js
                proj/test/genius-algorithm-side-effects.js
                proj/test/genius-algorithm-some-method.js
                proj/test/genius-algorithm-another-method.js
              ]
*/

// these need a config object passed in as the first (partial application) argument


function createContainsComparativeMatcher (config) {
  return function containsComparativeMatcher (sourceFile, testFile) {
    var sourceName = withoutExt(sourceFile.split(config.perturbSourceDir).pop());
    var testName = withoutExt(testFile.split(config.perturbTestDir).pop());
    return testName.slice(0, sourceName.length) === sourceName;
  };
}

module.exports = createContainsComparativeMatcher;
