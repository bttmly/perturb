"use strict";

var exec = require("child_process").exec;

function mochaChildProcessRunner (testFile, done) {
  var cmd = "mocha -b " + testFile;
  var opts = {timeout: 10000};
  var exited;

  var child = exec(cmd, opts, function (err, stdout, stderr) {
    done(err);
  });
}

module.exports = mochaChildProcessRunner;
