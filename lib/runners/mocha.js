"use strict";

var Mocha = require("mocha");

function runMutationInProcessWithMocha (mutation, done) {

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

  var mocha = new Mocha({reporter: mochaReporter, bail: true});
  mocha.addFile(mutation.testFile);

  // mocha blows up synchronously on .run() if an error is thrown during
  // require() resolution for that module (before tests start to actually run)
  try {
    mocha.run(function () { done(mutation); });
  } catch (err) {
    console.log("TEST EXPLODED OUTSIDE OF RUNNER");
    mutation.failed = err.toString();
    return done(mutation);
  }

}

module.exports = runMutationInProcessWithMocha;
