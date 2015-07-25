"use strict";

/*
  this file needs a lot of work

  - the setup/teardown IO should be moved out into a module
  - all the crap with creating a config object needs to be decoupled
    the cofig needs to be constructed, verified, and passed all over the place


  NEXT STEPS
  - a singleton config module that generates the canonical config for a single
    `perturb` process, other modules can require it transparently
    all the default config crap goes here, and that module includes the logic
    required to load third party plugins. It can then pass around a **frozen**
    configuration object for everyone to read from
*/

// bad stuff
// Error.stackTraceLimit = 100;
// process.setMaxListeners(0);

var path = require("path");
var exec = require("child_process").exec;
var assert = require("assert");

var async = require("async");
var glob = require("glob");

var handleMatch = require("./handle-match");
var pkgUtil = require("./pkg-util");
var matchFiles = require("./match-files");
var validateConfig = require("./config").validate;
var fileSystem = require("./file-system");

var isFunction = require("./util/is-function");
var ERRORS = require("./constant/errors");
var MESSAGES = require("./constant/messages");

function perturb (config, done) {

  function cleanup () {
    fileSystem.teardown(config);
    done.apply(null, arguments);
  }

  validateConfig(config);
  assert(isFunction(done), ERRORS.NoCallback);

  var meta = {};

  fileSystem.setup(config);

  var perturbSourceFiles = glob.sync(config.perturbSourceDir + config.sourceGlob);
  var perturbTestFiles = glob.sync(config.perturbTestDir + config.testGlob);

  var matches = matchFiles(perturbSourceFiles, perturbTestFiles, config.matcher);

  meta.matchesProcessed = matches.length;

  if (matches.length === 0) return cleanup(new Error(ERRORS.NoMatches));

  var start = Date.now();

  async.mapSeries(matches, handleMatch(config), function (err, matches) {
    if (err) return cleanup(err);

    meta.duration = Date.now() - start;
    meta.errored = !!err;
    meta.mutationCount = pkgUtil.countAllMutants(matches);
    meta.killedMutants = pkgUtil.countDeadMutants(matches);
    meta.killRate = meta.killedMutants / meta.mutationCount;

    var report = {
      meta: meta,
      config: config,
      matches: matches,
    };

    cleanup(null, report);
  });
}

module.exports = perturb;
