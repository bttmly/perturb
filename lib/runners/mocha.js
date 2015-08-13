"use strict";

var Mocha = require("mocha");
var _ = require("lodash");

function mochaInProcessRunner (testFile, _cb) {

  var failed;

  // in some cases mocha doesn't clean up it's handlers
  function done (failed) {
    removeMochaUncaughtExceptionHandlers();
    _cb(failed);
  }

  function mochaReporter (runner) {
    runner.on("fail", function (test) {
      // console.log("FAILED AT", test);
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
    // console.log("TEST EXPLODED OUTSIDE OF RUNNER", err);
    return done(err.toString());
  }

}

// that this is even necessary seems like a mocha bug.
// TODO create a minimal test case and report it
function removeMochaUncaughtExceptionHandlers () {
  if (Array.isArray(process._events.uncaughtException)) {
    _.remove(process._events.uncaughtException, function (handler) {
      return handler.name === "uncaught";
    });
    return;
  }

  if (process._events.uncaughtException.name === "uncaught") {
    delete process._events.uncaughtException;
  }
}

module.exports = mochaInProcessRunner;
