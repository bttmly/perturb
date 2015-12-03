"use strict";

var Mocha = require("mocha");
var R = require("ramda");
var _ = require("lodash");

function mochaInProcessRunner (testFile, _cb) {

  var failed;

  var removeMochaUncaughtExceptionListeners = R.pipe(
    // 'liseners()' executed here when pipeline invoked
    process.listeners.bind(process, "uncaughtException"),
    // 'listeners()' executed here when pipeline created
    R.reject(R.flip(R.contains)(process.listeners("uncaughtException"))),
    R.map(process.removeListener.bind(process, "uncaughtException"))
  );

  function done () {
    removeMochaUncaughtExceptionListeners();
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
    mocha.run(done);
  } catch (err) {
    // console.log("TEST EXPLODED OUTSIDE OF RUNNER", err);
    return done(err.toString());
  }

}



function invoke (name) {
  var args = [].slice.call(arguments, 1);
  return function (target) {
    return target[name].apply(target, args);
  }
}

// this function is unfortunate, but Mocha isn't very nice about 
// cleaning up its `uncaughtException` handlers so we have to do
// it for them. The handlers Mocha attaches have the name "uncaught"
// ... hopefully this doesn't change ...


module.exports = mochaInProcessRunner;
