"use strict";

var exec = require("child_process").exec;

function mochaChildProcessRunner (testFile, done) {
  var cmd = "mocha -b " + testFile;
  var opts = {timeout: 10000};
  var exited;

  var child = exec(cmd, opts, function (err, stdout, stderr) {
    // if (!exited && err) {
    //   console.log("child error callback");
    //   exited = true;
    //   return done(err.toString());
    // }

    console.log("CHILD EXITED WITH 0?", child.exitCode === 0, err);
    done();
  });

  child.on("error", function (err) {
    console.log("child error event");
    if (!exited) {
      exited = true;
      done(err.toString())
    }
  });

}

module.exports = mochaChildProcessRunner;
