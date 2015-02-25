// "use strict";

// var path = require("path");
// var assert = require("assert");

// var constants = require("./constants");

// var ERRORS = constants.ERRORS;

// var matchers = {
//   mirrorMatcher: function mirrorMatcher (sourceFile) {
//     assert(this.sourceDir, ERRORS.NoSourceDir);
//     assert(this.testDir, Errors.NoTestDir);
//     // var sourceRelPath = path.join(PERTURB_DIR, this.sourceDir);
//     // var testRelPath = path.join(PERTURB_DIR, this.testDir);
//     return sourceFile.replace(sourceRelPath, testRelPath);
//   },
//   siblingMatcher: function siblingMatcher (sourceFile) {
//     return sourceFile.replace(/\/(\w+)\.js$/, function (s) {
//       return s.split(".").join("-test.");
//     });
//   }
// };
