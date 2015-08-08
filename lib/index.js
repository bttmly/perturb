"use strict";

// bad stuff
// Error.stackTraceLimit = 100;

var path = require("path");
var _ = require("lodash");

global.log = function () {

  var args = [].slice.call(arguments);

  [].forEach.call(args, function (x) {
    if (x === undefined) {
      console.trace;
    }
  });

  console.log.apply(console, args);
}

global.flog = function () {
  console.trace();
  console.log.apply(console, arguments);
}

global.j = function (obj) {
  console.log(JSON.stringify(obj, function (k, v) {
    if (k === "ast") return null;
  }, 4));
}

// process.setMaxListeners(0);

var assert = require("assert");

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



    console.log("PROC MATCH LEN", processedMatches.length);

    console.log("CLEAN FILES", processedMatches.filter(function (p) {
      return !(p.failed);
    }).length);

    var meta = {
      duration: Date.now() - start,
      matchesCount: processedMatches.length,
      // mutantCount: pkgUtil.countAllMutants(processedMatches),
      // killedMutants: pkgUtil.countDeadMutants(processedMatches),
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
