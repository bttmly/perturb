"use strict";

var fs = require("fs-extra");
var Mocha = require("mocha");
var diff = require("diff");
var assign = require("object-assign");
var pick = require("lodash.pick");

var handlers = require("./mocha-handlers");

module.exports = function runMutation (mutation, done) {

  var counters = {
    passed: [],
    failed: []
  };
  
  // This is sort of silly
  //
  // We have the mutated source code in memory, which we write
  // to a file, which is then `require`d by the test file, which
  // itself must be repeatedly `require`d by Mocha.
  // 
  // Is there any way hand off arbitrary code to Mocha to run it?
  // We could give it the test code, then intercept the require call,
  // passing back an object in memory as the module under test
  //
  // Is there a module that takes a file path and a string of code
  // and evaluates it as Node would (i.e. returns `module.exports`)
  // while honoring `require` statements as if they came from the given
  // path?
  // 
  // I suspect we need to use Node's 'module' module, but it's not well-
  // documented.

  var mocha = new Mocha({reporter: handlers.reporter(counters)});
  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);
  mocha.addFile(mutation.testFile);

  mocha.run(function () {
    clearCache(mutation); /* this is essential cleanup */
    done(null, formatMutation(mutation, counters));
  });

};

function clearCache (mutation) {
  delete require.cache[mutation.testFile];
  delete require.cache[mutation.sourceFile];
}

function generateDiff (mutation) {
  return diff.diffLines(mutation.genSourceCode, mutation.mutSourceCode)
    .filter(function (node) {
      return (node.added || node.removed);
    });
}

function formatMutation (mutation, counters) {
  var result = assign(pick(mutation, "loc", "name"), counters);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  if (result.passed.length && !result.failed.length) {
    result.diff = generateDiff(mutation);
  }
  return result;
} 