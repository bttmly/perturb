"use strict";

var exec = require("child_process").exec;
var formatMutation = require("./helpers").formatMutation;

function runMutationInChildProcessWithMocha (mutation, mutantReporter, done) {
  return function () {
    var cmd = "mocha -b " + mutation.testFile;
    var opts = {timeout: 10000};
    var child = exec(cmd, opts, function (err, stdout, stderr) {
      if (err) {
        // TODO can we differentiate legitimate test-runner errors from broken stuff
        // within this library? Running in-process makes it pretty easy (it blows up
        // completely) but when observing a child process all we see are exits with
        // (or without) errors. Parsing the stack trace seems error prone.
        mutation.failed = "One of the tests failed!";
      }
      done(formatMutation(mutation), mutantReporter);

    });
  };
}

module.exports = runMutationInChildProcessWithMocha;
