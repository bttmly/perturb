"use strict";

var domain = require("domain");

var fs = require("fs-extra");
var Mocha = require("mocha");
var diff = require("diff");
var assign = require("object-assign");
var makeModule = require("make-module");
var intercept = require("intercept-require");

var runners = require("./runners");
var pkgUtil = require("./pkg-util");
var ERRORS = require("./constant/errors");

// TODO consider how caching mutated modules works
// (one part of a library requiring another part that has been mutated)
// ideally every file in the library gets purged from the require cache?

// running mutation tests out-of-process handles this (right?)

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

function formatMutation (mutation) {
  var result = assign({}, mutation);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  result.diff = generateDiff(mutation);
  return result;
}


function createMutationRunner (config) {

  function finish (done) {
    return function (mutant) {
      var shouldReport = config.verbose || !pkgUtil.mutantIsDead(mutant);

      mutant = formatMutation(mutant);

      if (shouldReport) config.mutantReporter(mutant);

      clearCache(mutant);
      done(null, mutant);
    };
  }

  return function runMutation (mutation, done) {

    var runnerName = config.runner || "mocha";
    var runner = runners[runnerName];

    if (runner == null) {
      throw new Error(ERRORS.InvalidReporter);
    }

    fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);

    runner(mutation, finish(done));
  };

}


module.exports = createMutationRunner;
