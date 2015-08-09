"use strict";

// bad stuff
Error.stackTraceLimit = 100;
// process.setMaxListeners(0);

var assert = require("assert");

var _ = require("lodash");
var async = require("async");
var glob = require("glob");

var pkgUtil = require("./pkg-util");
var validateConfig = require("./types/config");
var matchFiles = require("./multi-match-files");
var handleMatch = require("./handle-multi-match");

var fileSystem = require("./file-system");

var isFunction = require("./util/is-function");
var ERRORS = require("./constant/errors");

function perturb (config, done) {
  validateConfig(config);

  console.log("Pertrubing with config");
  console.log(config);

  assert(isFunction(done), ERRORS.NoCallback);

  function cleanup (err, output) {
    fileSystem.teardown(config);
    done(err, output);
  }

  fileSystem.setup(config);

  var perturbSourceFiles = glob.sync(config.perturbSourceDir + config.sourceGlob);
  var perturbTestFiles = glob.sync(config.perturbTestDir + config.testGlob);
  var matches = matchFiles(perturbSourceFiles, perturbTestFiles, config.matcher);

  if (matches.length === 0) return cleanup(new Error(ERRORS.NoMatches));

  var start = Date.now();

  async.mapSeries(matches, handleMatch(config), function (err, processedMatches) {
    if (err) return cleanup(err);

    // now we're at the per-source file level
    processedMatches = _.flatten(processedMatches);

    var mutants = _.flatten(_.pluck(processedMatches, "mutants"));

    var meta = {
      duration: Date.now() - start,
      matchesCount: processedMatches.length,
      mutantCount: mutants.length,
      killedMutants: mutants.filter(function (m) { return m.failed; }).length,
    };

    meta.killRate = meta.killedMutants / meta.mutantCount;

    cleanup(null, {
      meta: meta,
      config: config,
      matches: matches,
    });
  });
}

module.exports = perturb;
