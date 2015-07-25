"use strict";

// This is a mutation running strategy which bypasses file system I/O
// entirely by generating modules directly from mutated source code, and short circuiting
// the `require` mechanism of the module under test. In larger projects it may exhibit
// substantial speed gains, but it's performance and stability must first be examined.

var makeModule = require("make-module");
var intercept = require("intercept-require");
var Mocha = require("mocha");

function runMutantInProcessWithMochaAndInterception (mutant, done) {

  mutant.passedCount = 0;

  function mochaReporter (runner) {
    runner
      .on("pass", function () {
        mutant.passedCount += 1;
      })
      .on("fail", function (test) {
        mutant.failed = test.fullTitle();
      });
  }

  var mutatedModule = makeModule(mutant.mutSourceCode, mutant.sourceFile);

  if (mutatedModule.error) {
    mutant.failed = mutatedModule.error.toString();
    return done(mutant);
  }

  intercept.attach({
    shortCircuit: true,
    shortCircuitMatch: function (info) {
      return (info.absPath === mutant.sourceFile);
    },
  });

  intercept.setListener(function (result, info) {
    if (info.didShortCircuit) {
      return mutatedModule.exports;
    }
    return result;
  });

  new Mocha({reporter: mochaReporter, bail: true})
    .addFile(mutant.testFile)
    .run(function () {
      done(mutant);
    });
}

module.exports = runMutantInProcessWithMochaAndInterception;

