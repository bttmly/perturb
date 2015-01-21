"use strict";

var fs = require("fs-extra");
var Mocha = require("mocha");
var diff = require("diff");
var assign = require("object-assign");
var pick = require("lodash.pick");
var makeModule = require("make-module");
var intercept = require("intercept-require");

var handlers = require("./mocha-handlers");

module.exports = function (mutant, reporter, done) {
  if (global.__perturb__.intercept)
    return runMutationWithInterception(mutant, reporter, done);
  runMutationWithIo(mutant, reporter, done);
};

function finish (mutant, reporter, done) {
  intercept.detach();
  reporter(mutant);
  clearCache(mutant);
  done(null, mutant);
}

function tryCall (fn, catchFn) {
  try {
    fn();
  } catch (e) {
    if (catchFn) catchFn(e);
  }
}

// this will take a MutantReporter eventually
function runMutationWithIo (mutation, reporter, done) {

  var counters = {
    passed: [],
    failed: []
  };

  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);
  
  tryCall(
    function () {
      new Mocha({reporter: handlers.reporter(counters)})
        .addFile(mutation.testFile)
        .run(function () {
          finish(formatMutation(mutation, counters), reporter, done);
        });
    }, function (err) {
      counters.failed.push(err);
      return finish(formatMutation(mutation, counters), reporter, done);
    });
}


// This is a (currently unused) mutation running strategy which bypasses file system I/O
// entirely by generating modules directly from mutated source code, and short circuiting 
// the `require` mechanism of the module under test. In larger projects it may exhibit 
// substantial speed gains, but it's performance and stability must first be examined.
function runMutationWithInterception (mutation, reporter, done) {
  var counters = {
    passed: [],
    failed: []
  };

  var mutatedModule = makeModule(mutation.mutSourceCode, mutation.sourceFile);  

  if (mutatedModule.error) {
    // TODO make sure whetever we push in conforms
    counters.failed.push(mutatedModule.error);
    return finish(formatMutation(mutation, counters), reporter, done);
  }

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
      finish(formatMutation(mutation, counters), reporter, done);
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
  var result = assign({}, mutation, counters);
  // var result = assign(pick(mutation, "loc", "name", "mutSourceCode"), counters);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  if (!result.failed.length) {
    result.diff = generateDiff(mutation);
  }
  return result;
} 