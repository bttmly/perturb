"use strict";
var _ = require("lodash");
var Mocha = require("mocha");

function runMutationInProcessWithMocha (mutation, done) {

  mutation.passedCount = 0;

  function mochaReporter (runner) {
    runner
      .on("pass", function () {
        mutation.passedCount += 1;
      })
      .on("fail", function (test) {
        console.log("BLOWN TEST");
        mutation.failed = test.fullTitle();
      });
  }
  var err;
  var mocha = new Mocha({reporter: mochaReporter, bail: true});
  mocha.addFile(mutation.testFile);

  // mocha blows up synchronously on .run() if an error is thrown during
  // require() resolution for that module (before tests start to actually run)
  try {
    mocha.run(function () { done(mutation); });
  } catch (actual) {
    err = {};
    err.message = "MOCHA RUNNER PANIC " + actual.toString();
    err.stack = actual.stack;
    err.toString = function () {
      return( 
        Error.prototype.toString(actual) + "\n" +
        actual.stack
      );
    }
    mutation.failed = err;
  }

  console.log("NO SYNC BURST BUT");
  console.log("SHIT IS FUCKED");
  console.log("MUT SOURCE", mutation.sourcePath);
  console.log(mutation.failed);

  return done(formatMutation(mutation));

}


function formatMutation (mut) {
  return _.omit(mut, [
    "ast",
    "sourceCode",
    "mutSourceCode",
  ]);
}

module.exports = runMutationInProcessWithMocha;
