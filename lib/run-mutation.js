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
var DEFAULT_RUNNER = "mocha";
// var DEFAULT_RUNNER = "mochaChild";

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

function finish (done, runnerDomain, config) {
  return function (mutant) {
    // var shouldReport = /* global.__perturb__.verbose || */ !pkgUtil.mutantIsDead(mutant);
    var shouldReport = true;

    mutant = formatMutation(mutant);


    if (runnerDomain) runnerDomain.exit();
    if (shouldReport) config.mutantReporter(mutant);

    intercept.detach();
    clearCache(mutant);
    done(null, mutant);
  };
}

function createMutationRunner (config) {

  return function runMutation (mutation, done) {


    var runnerName = config.runner || DEFAULT_RUNNER;

    var runner = runners[runnerName];

    if (runner == null) {
      throw new Error(ERRORS.InvalidReporter);
    }

    fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);

    var runnerDomain = domain.create();

    var next = finish(done, runnerDomain, config);

    runnerDomain.on("error", function (err) {
      console.log("caught in domain");
      process.nextTick(function () {
        mutation.error = err;
        mutation.failed = err.toString();
        next(mutation);
      });
    });
    runnerDomain.run(runner(mutation, next));

    // runner(mutation, mutantReporter, finish(done))();
  };

}


module.exports = createMutationRunner;

// This is a mutation running strategy which bypasses file system I/O
// entirely by generating modules directly from mutated source code, and short circuiting
// the `require` mechanism of the module under test. In larger projects it may exhibit
// substantial speed gains, but it's performance and stability must first be examined.

// function runMutationWithInterception (mutation, mutantReporter, done) {

//   mutation.passedCount = 0;

//   function mochaReporter (runner) {
//     runner
//       .on("pass", function () {
//         mutation.passedCount += 1;
//       })
//       .on("fail", function (test) {
//         mutation.failed = test.fullTitle();
//       });
//   }

//   var mutatedModule = makeModule(mutation.mutSourceCode, mutation.sourceFile);

//   if (mutatedModule.error) {
//     mutation.failed = mutatedModule.error.toString();
//     return finish(done)(formatMutation(mutation), mutantReporter);
//   }

//   intercept.attach({
//     shortCircuit: true,
//     shortCircuitMatch: function (info) {
//       return (info.absPath === mutation.sourceFile);
//     }
//   });

//   intercept.setListener(function (result, info) {
//     if (info.didShortCircuit) {
//       return mutatedModule.exports;
//     }
//     return result;
//   });

//   new Mocha({reporter: mochaReporter, bail: true})
//     .addFile(mutation.testFile)
//     .run(function () {
//       finish(done)(formatMutation(mutation), mutantReporter);
//     });
// }

// module.exports = function (mutant, reporter, done) {
//   if (global.__perturb__.interception) {
//     return runMutationWithInterception(mutant, reporter, done);
//   }
//   runMutationWithIo(mutant, reporter, done);
// };
