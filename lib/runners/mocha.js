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
        console.log("caught mocha fail");
        mutation.failed = test.fullTitle();
      });
  }

  return function () {
    new Mocha({reporter: mochaReporter, bail: true})
      .addFile(mutation.testFile)
      .run(function () {
        done(mutation);
      });
  };

}

module.exports = runMutationInProcessWithMocha;
