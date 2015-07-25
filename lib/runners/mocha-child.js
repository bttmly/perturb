"use strict";

var exec = require("child_process").exec;

function runMutantInMochaChildProcess (mutant, done) {
  var cmd = "mocha -b " + mutant.testFile;
  var opts = {timeout: 10000};
  var child = exec(cmd, opts, function (err, stdout, stderr) {
    if (err) {
      // TODO can we differentiate legitimate test-runner errors from broken stuff
      // within this library? Running in-process makes it pretty easy (it blows up
      // completely) but when observing a child process all we see are exits with
      // (or without) errors. Parsing the stack trace seems error prone.

      // shouldn't treat mutant as mutable
      mutant.failed = "One of the tests failed!";
    }
    done(mutant);

  });
}

module.exports = runMutantInMochaChildProcess;
