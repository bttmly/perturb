"use strict";

var fs = require("fs-extra");
var diff = require("diff");
var assign = require("object-assign");

var runners = require("./runners");
var pkgUtil = require("./pkg-util");
var invalidateRequireCache = require("./util/invalidate-require-cache");
var ERRORS = require("./constant/errors");

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

function createMutantRunner (config) {

  // this is only necessary for in-process test runners.
  function clearCache (mutation) {
    delete require.cache[mutation.testFile];
    delete require.cache[mutation.sourceFile];
    // if (config.cacheInvalidationPredicate) {
    //   invalidateRequireCache(config.cacheInvalidationPredicate);
    // }
  }

  // note: finish does NOT cleanup after a run. This is to reduce the number of
  // times we have to go out to the file system, since most times another runner
  // will come along right after this one and overwrite the file
  // HOWEVER it means that the caller must be relied on to cleanup after all
  // mutants have been run
  function finish (done) {
    return function (mutant) {
      var shouldReport = config.verbose || !pkgUtil.mutantIsDead(mutant);
      mutant = formatMutant(mutant);
      if (shouldReport) config.mutantReporter(mutant);
      clearCache(mutant);
      done(null, mutant);
    };
  }

  return function runMutant (mutant, done) {
    var runnerName = config.runner || "mocha";
    var runner = runners[runnerName];

    if (runner == null) {
      throw new Error(ERRORS.InvalidReporter);
    }

    fs.writeFileSync(mutant.sourceFile, mutant.mutSourceCode);
    runner(mutant, finish(done));
  };

}


module.exports = createMutantRunner;
