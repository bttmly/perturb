"use strict";

var Mocha = require("mocha");
var diffLines = require("diff").diffLines;
var assign = require("object-assign");

var exec = require("child_process").exec;


function formatMutation (mutation) {
  var result = assign({}, mutation);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  if (!result.failed) {
    result.diff = generateDiff(mutation);
  }
  return result;
}

function generateDiff (mutation) {
  return diffLines(mutation.genSourceCode, mutation.mutSourceCode)
    .filter(function (node) {
      return (node.added || node.removed);
    });
}

// executing runners in-process seems sketchy -- ideally we would shell out for it
// and use the exit code, but can we still gather enough data about the process if
// we aren't able to access it interactively/programmatically?

// making runners work like this also makes authoring them much harder. should be as
// easy as "mocha test-file.js" or "tape test-file.js" or "jasmine test-file.js", right?

// can't recover from certain kinds of errors running tests in-process either.
// (infinite loops caused by mutations, for example).

// ... however, running them in-process is EXTREMELY FAST relative to using a child
// process. Anecdotal dogfooding on mutators.js (before breaking it into separate
// modules) ran 25-35x faster in-process (observed times between 97-135s for child vs.
// consistent 3.5-4s in-process)

// child processes have better guarantees around some conditions, but a speed difference
// of that degree means it is essential to at least explore running mutations in-process
// (perhaps with reduced accuracy/environmental purity guarantees)

// TODO explore how to parallelize this. It's unclear how much of the child process
// start up time is just wasted. If we have a simple way to dictate parallelism we
// can see experimentally how close we can get child process running to in-process.
// (... with the obvious caveat that we could parallelize in-process execution)

// should provide APIs for configuring both in-process and child process test runners

module.exports = {

  mocha: function (mutation, mutantReporter, done) {

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

  },

  mochaChild: function (mutation, mutantReporter, done) {
    return function () {
      var cmd = "mocha -b " + mutation.testFile;
      var opts = {timeout: 10000};
      console.log("MOCHA CMD", cmd);
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

      child.on("error", function (err) {
        
      });
    };
  }

};
