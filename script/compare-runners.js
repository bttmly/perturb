var silence = (function () {

  var methods = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    dir: console.dir,
    time: console.time,
    timeEnd: console.timeEnd,
    trace: console.trace,
    assert: console.assert,
  }

  function noop () {}

  return function silence () {

    Object.keys(methods).forEach(function (k) {
      console[k] = noop;
    });

    return function restore () {
      Object.keys(methods).forEach(function (k) {
        console[k] = methods[k];
      });
    }
  };

})();


var assert = require("assert");

var generateConfig = require("../lib/config");
var runners = require("../lib/runners");
var perturb = require("../lib");


function compare (runnerA, runnerB) {
  var optionsA = generateConfig({runner: runnerA});
  var optionsB = generateConfig({runner: runnerB});
  console.log("Comparing", runnerA.name, runnerB.name);

  var restore = silence();
  perturb(optionsA, function (err, outputA) {
    if (err) throw err;

    perturb(optionsB, function (err, outputB) {
      if (err) throw err;

      restore();
      var metaA = outputA.meta;
      var metaB = outputB.meta;

      assert(metaA.matchesCount === metaB.matchesCount);
      assert(metaA.mutantCount === metaB.mutantCount);
      assert(metaA.killedMutants === metaB.killedMutants);

      console.log("Runners match!");
      console.log(runners[runnerA].name, "duration:", metaA.duration);
      console.log(runners[runnerB].name, "duration:", metaB.duration);
    });
  });
}

compare("mocha", "mochaChild");


