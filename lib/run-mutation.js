"use strict";

var fs = require("fs-extra");
var Mocha = require("mocha");
var diff = require("diff");
var assign = require("object-assign");
var pick = require("lodash.pick");
var makeModule = require("make-module");
var intercept = require("intercept-require");

var handlers = require("./mocha-handlers");

module.exports = runMutationWithIo;

function runMutationWithIo (mutation, done) {

  var counters = {
    passed: [],
    failed: []
  };

  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);
  
  new Mocha({reporter: handlers.reporter(counters)})
    .addFile(mutation.testFile)
    .run(function () {
      clearCache(mutation);
      done(null, formatMutation(mutation, counters));
    });
}


function runMutationWithInterception (mutation, done) {
  var counters = {
    passed: [],
    failed: []
  };

  var mutatedModule = makeModule(mutation.mutSourceCode, mutation.sourceFile);  

  intercept.attach(null, {
    shortCircuit: true, 
    shortCircuitMatch: function (info) {
      return info.absPath === mutation.sourceFile;
    }
  });

  intercept.setListener(function (result, info) {
    if (info.didShortCircuit) {
      return mutatedModule.exports;
    }
    return result;
  });

  new Mocha({reporter: handlers.reporter(counters)})
    .addFile(mutation.testFile)
    .run(function () {
      clearCache(mutation);
      intercept.detach();
      done(null, formatMutation(mutation, counters));
    });
}

function clearCache (mutation) {
  delete require.cache[mutation.testFile];
  delete require.cache[mutation.sourceFile];
}

function generateDiff (mutation) {
  return diff.diffLines(mutation.genSourceCode, mutation.mutSourceCode)
    .filter(function (node) {
      return (node.added || node.removed);
    });
}

function formatMutation (mutation, counters) {
  var result = assign(pick(mutation, "loc", "name", "mutSourceCode"), counters);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  if (result.passed.length && !result.failed.length) {
    result.diff = generateDiff(mutation);
  }
  return result;
} 