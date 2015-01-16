"use strict";

var fs = require("fs-extra");
var Mocha = require("mocha");
var diff = require("diff");
var assign = require("object-assign");
var pick = require("lodash.pick");
var makeModule = require("make-module");
var intercept = require("intercept-require");

var handlers = require("./mocha-handlers");

module.exports = runMutationWithIo;

// this will take a MutantReporter eventually
function runMutationWithIo (mutation, reporter, done) {

  var counters = {
    passed: [],
    failed: []
  };

  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);
  
  new Mocha({reporter: handlers.reporter(counters)})
    .addFile(mutation.testFile)
    .run(function () {
      clearCache(mutation);
      var mutant = formatMutation(mutation, counters);
      
      reporter(mutant);
      done(null, mutant);
    });
}


// This is a (currently unused) mutation running strategy which bypasses file system I/O
// entirely by generating modules directly from mutated source code, and short circuiting 
// the `require` mechanism of the module under test. In larger projects it may exhibit 
// substantial speed gains, but it's performance and stability must first be examined.

function runMutationWithInterception (mutation, reporter, done) {
  console.log(mutation.name);

  var counters = {
    passed: [],
    failed: []
  };

  // Current issue: makeModule() will throw when trying run mutated code in some cases.
  // One example is trying to require a module whose name has been tweaked. This is a 
  // valid(ish) mutant and we should handle it at such. Any good way to get Mocha to
  // catch this for us? :/

  var mutatedModule = makeModule(mutation.mutSourceCode, mutation.sourceFile);  

  intercept.attach(null, {
    shortCircuit: true, 
    shortCircuitMatch: function (info) {
      return info.absPath === mutation.sourceFile;
    }
  });

  intercept.setListener(function (result, info) {
    if (info.didShortCircuit) {
      return mutatedModule.exports;
    }
    return result;
  });

  new Mocha({reporter: handlers.reporter(counters)})
    .addFile(mutation.testFile)
    .run(function () {
      clearCache(mutation);
      intercept.detach();
      done(null, formatMutation(mutation, counters));
    });
}

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
  var result = assign(pick(mutation, "loc", "name", "mutSourceCode"), counters);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  if (result.passed.length && !result.failed.length) {
    result.diff = generateDiff(mutation);
  }
  return result;
} 