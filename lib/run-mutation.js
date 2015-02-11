"use strict";

var domain = require("domain");

var fs = require("fs-extra");
var Mocha = require("mocha");
var diff = require("diff");
var assign = require("object-assign");
var makeModule = require("make-module");
var intercept = require("intercept-require");

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
  var result = assign({}, mutation, counters);
  // var result = assign(pick(mutation, "loc", "name", "mutSourceCode"), counters);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  if (!result.failed.length) {
    result.diff = generateDiff(mutation);
  }
  return result;
}

function finish (mutant, reporter, done) {
  intercept.detach();
  reporter(mutant);
  clearCache(mutant);
  done(null, mutant);
}

function failFromError (err) {
  return {
    fullTitle: function () {
      return err.toString();
    }
  };
}

function makeFailCollector (counters) {
  return function failCollector (runner) {
    runner
      .on("pass", function (test) {
        counters.passed.push(test.fullTitle());
      })
      .on("fail", function (test) {
        counters.failed.push(test.fullTitle());
      });
  };
}

// this will take a MutantReporter eventually
function runMutationWithIo (mutation, mutantReporter, done) {

  var counters = {
    passed: [],
    failed: []
  };

  var mochaReporter = makeFailCollector(counters);

  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);

  // Wrap the mocha runner in a domain so that we can catch compile errors from mutated code
  var d = domain.create();

  d.on("error", function (err) {
    d.exit();
    process.nextTick(function () {
      counters.failed.push(failFromError(err));
      finish(formatMutation(mutation, counters), mutantReporter, done);
    });
  });

  d.run(function () {
    new Mocha({reporter: mochaReporter, bail: true})
      .addFile(mutation.testFile)
      .run(function () {
        finish(formatMutation(mutation, counters), mutantReporter, done);
      });
  });

}


// This is a mutation running strategy which bypasses file system I/O
// entirely by generating modules directly from mutated source code, and short circuiting 
// the `require` mechanism of the module under test. In larger projects it may exhibit 
// substantial speed gains, but it's performance and stability must first be examined.
function runMutationWithInterception (mutation, mutantReporter, done) {

  var counters = {
    passed: [],
    failed: []
  };

  var mochaReporter = makeFailCollector(counters);

  var mutatedModule = makeModule(mutation.mutSourceCode, mutation.sourceFile);

  if (mutatedModule.error) {
    counters.failed.push(failFromError(mutatedModule.error));
    return finish(formatMutation(mutation, counters), mutantReporter, done);
  }

  intercept.attach({
    shortCircuit: true, 
    shortCircuitMatch: function (info) {
      var result = (info.absPath === mutation.sourceFile);
      return result;
    }
  });

  intercept.setListener(function (result, info) {
    if (info.didShortCircuit) {
      return mutatedModule.exports;
    }
    return result;
  });


  new Mocha({reporter: mochaReporter, bail: true})
    .addFile(mutation.testFile)
    .run(function () {
      finish(formatMutation(mutation, counters), mutantReporter, done);
    });
}

module.exports = function (mutant, reporter, done) {
  if (global.__perturb__.interception) {
    return runMutationWithInterception(mutant, reporter, done);
  }
  runMutationWithIo(mutant, reporter, done);
};