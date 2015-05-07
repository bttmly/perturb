"use strict";

var Mocha = require("mocha");
var diff = require("diff");
var assign = require("object-assign");

function formatMutation (mutation) {
  var result = assign({}, mutation);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  if (!result.failed) {
    result.diff = generateDiff(mutation);
  }
  return result;
}

function generateDiff (mutation) {
  return diff.diffLines(mutation.genSourceCode, mutation.mutSourceCode)
    .filter(function (node) {
      return (node.added || node.removed);
    });
}

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

  }

};
