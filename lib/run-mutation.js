"use strict";

var fs = require("fs-extra");
var escodegen = require("escodegen");
var Mocha = require("mocha");
var diff = require("diff");
var assign = require("object-assign");
var pick = require("lodash.pick");

var handlers = require("./mocha-handlers");

module.exports = function runMutation (mutation, done) {

  var counters = {
    passed: [],
    failed: []
  };
  
  var mocha = new Mocha({reporter: handlers.reporter(counters)});
  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);
  mocha.addFile(mutation.testFile);

  mocha.run(function (failures) {
    clearCache(mutation); // !!! IMPORTANT !!!
    done(null, formatMutation(mutation, counters));
  });

};

function clearCache (mutation) {
  delete require.cache[mutation.testFile];
  delete require.cache[mutation.sourceFile];
}

function diffMutation (mutation) {
  return diff.diffLines(mutation.genSourceCode, mutation.mutSourceCode).filter(function (node) {
    return (node.added || node.removed);
  });
}

function formatMutation (mutation, counters) {
  var result = assign(pick(mutation, "loc", "name"), counters);
  if (result.passed.length && !result.failed.length) {
    result.diff = diffMutation(mutation);
  }
  return result;
} 