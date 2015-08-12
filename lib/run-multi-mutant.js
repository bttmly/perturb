"use strict";

var fs = require("fs-extra");
var diff = require("diff");
var assign = require("object-assign");

var runners = require("./runners");
var pkgUtil = require("./pkg-util");
var invalidateRequireCache = require("./util/invalidate-require-cache");
var ERRORS = require("./constant/errors");

var DEFAULT_RUNNER = "mocha";

// TODO consider how caching mutated modules works
// (one part of a library requiring another part that has been mutated)
// ideally every file in the library gets purged from the require cache?

// running mutant tests out-of-process handles this (right?)

// we probably want to actually iterate the require cache and invalidate it
// with a regular expression, or some other scheme

function generateDiff (mutation) {
  return diff.diffLines(mutation.genSourceCode, mutation.mutSourceCode)
    .filter(function (node) {
      return (node.added || node.removed);
    });
}

function formatMutant (mutant) {
  var result = assign({}, mutant);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  result.diff = generateDiff(mutant);
  return result;
}

function createMultiMutantRunner (config) {

  // this is only necessary for in-process test runners.

  return function runMultiMutant (mutant, _done) {
    var last = finish(config, _done);
    var tests = mutant.testFiles.slice();

    var runner = runners[config.runner || DEFAULT_RUNNER];
    if (runner == null) {
      throw new Error(ERRORS.InvalidReporter);
    }
    
    var current;

    function runNext (failure) {
      // out of tests to run or mutant killed

      if (failure) {
        mutant.failed = failure;
        return last(mutant);
      }

      if (tests.length === 0) {
        return last(mutant);
      }

      current = tests.pop();

      // Consider what kind of API we want to provide here
      fs.writeFileSync(mutant.sourceFile, mutant.mutSourceCode);
      runner(current, runNext);
    }

    runNext();

  };

}

// note: finish does NOT cleanup after a run. This is to reduce the number of
// times we have to go out to the file system, since most times another runner
// will come along right after this one and overwrite the file
// HOWEVER it means that the caller must be relied on to cleanup after all
// mutants have been run
function finish (config, done) {
  return function (mutant) {
    var shouldReport = true || config.verbose || !pkgUtil.mutantIsDead(mutant);
    mutant = formatMutant(mutant);
    if (shouldReport) config.mutantReporter(mutant);
    clearCache(config, mutant);
    done(null, mutant);
  };
}

function clearCache (mutant) {
  delete require.cache[mutant.testFile];
  delete require.cache[mutant.sourceFile];
  // if (config.cacheInvalidationPredicate) {
  //   invalidateRequireCache(config.cacheInvalidationPredicate);
  // }
}

module.exports = createMultiMutantRunner;
