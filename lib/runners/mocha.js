"use strict";

var Mocha = require("mocha");

function mochaInProcessRunner (testFile, done) {

  var failed;

  function mochaReporter (runner) {
    runner.on("fail", function (test) {
      console.log("FAILED AT", test);
      // should return whole test object?
      // No, but maybe a standard subset incl name and stack
      failed = test.fullTitle();
    });
  }

  var mocha = new Mocha({reporter: mochaReporter, bail: true});
  mocha.addFile(testFile);

  // mocha blows up synchronously on .run() if an error is thrown during
  // require() resolution for that module (before tests start to actually run)
  try {
    mocha.run(function () { 
      done(failed); 
    });
  } catch (err) {
    console.log("TEST EXPLODED OUTSIDE OF RUNNER", err);
    return done(err.toString());
  }

}

module.exports = mochaInProcessRunner;
