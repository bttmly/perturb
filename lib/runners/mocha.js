"use strict";

var Mocha = require("mocha");
var formatMutation = require("./helpers").formatMutation;

function runMutationInProcessWithMocha (mutation, mutantReporter, done) {

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

  return function () {
    new Mocha({reporter: mochaReporter, bail: true})
      .addFile(mutation.testFile)
      .run(function () {
        done(formatMutation(mutation), mutantReporter);
      });
  };

}

module.exports = runMutationInProcessWithMocha;
