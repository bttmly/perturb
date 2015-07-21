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
var ERRORS = require("./constants").ERRORS;

var DEFAULT_RUNNER = "mochaChild";

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
  if (!result.failed) {
    result.diff = generateDiff(mutation);
  }
  return result;
}

function finish (done, domain) {
  return function (mutant, reporter) {
    var shouldReport = global.__perturb__.verbose || !pkgUtil.mutantIsDead(mutant);
    var err;

    if (domain) domain.exit();
    if (shouldReport) reporter(mutant);

    intercept.detach();
    clearCache(mutant);
    done(null, mutant);
  };
}

function runMutationWithIo (mutation, mutantReporter, done) {

  var runnerDomain = domain.create();

  var runnerName = global.__perturb__.runner || DEFAULT_RUNNER;
  var runner = runners[runnerName];

  if (runner == null) {
    throw new Error(ERRORS.InvalidReporter);
  }

  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);

  runnerDomain.on("error", function (err) {
    runnerDomain.exit();
    process.nextTick(function () {
      mutation.error = err;
      mutation.failed = err.toString();
      finish(done)(mutation, mutantReporter);
    });
  });

  runnerDomain.run(runner(mutation, mutantReporter, finish(done, runnerDomain)));
}


// This is a mutation running strategy which bypasses file system I/O
// entirely by generating modules directly from mutated source code, and short circuiting
// the `require` mechanism of the module under test. In larger projects it may exhibit
// substantial speed gains, but it's performance and stability must first be examined.
function runMutationWithInterception (mutation, mutantReporter, done) {

  mutation.passedCount = 0;

  function mochaReporter (runner) {
    runner
      .on("pass", function () {
        mutation.passedCount += 1;
      })
      .on("fail", function (test) {
        mutation.failed = test.fullTitle();
      });
  }

  var mutatedModule = makeModule(mutation.mutSourceCode, mutation.sourceFile);

  if (mutatedModule.error) {
    mutation.failed = mutatedModule.error.toString();
    return finish(done)(formatMutation(mutation), mutantReporter);
  }

  intercept.attach({
    shortCircuit: true,
    shortCircuitMatch: function (info) {
      return (info.absPath === mutation.sourceFile);
    }
  });

  intercept.setListener(function (result, info) {
    if (info.didShortCircuit) {
      return mutatedModule.exports;
    }
    return result;
  });

  new Mocha({reporter: mochaReporter, bail: true})
    .addFile(mutation.testFile)
    .run(function () {
      finish(done)(formatMutation(mutation), mutantReporter);
    });
}

module.exports = function (mutant, reporter, done) {
  if (global.__perturb__.interception) {
    return runMutationWithInterception(mutant, reporter, done);
  }
  runMutationWithIo(mutant, reporter, done);
};
