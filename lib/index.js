"use strict";

// bad stuff
Error.stackTraceLimit = 100;
process.setMaxListeners(0);

var path = require("path");
var exec = require("child_process").exec;

var async = require("async");
var fs = require("fs-extra");
var glob = require("glob");
var assign = require("object-assign");

var handleMatch = require("./handle-match");
var reporters = require("./reporters");
var pkgUtil = require("./pkg-util");
var constants = require("./constants");
var matchFiles = require("./match-files");

var JS_TYPES = constants.JS_TYPES;
var ERRORS = constants.ERRORS;
var MESSAGES = constants.MESSAGES;

var join = path.join;

// move these strings to `constants.js`
var DEFAULT_SOURCE = "lib";
var DEFAULT_TEST = "test";
var PERTURB_DIR = ".perturb";
var DEFAULT_GLOB = "/**/*.js";

function main (settings, cb) {
  var cmd = settings.testCmd || MESSAGES.DefaultTest;
  console.log(MESSAGES.ExecutingTests, cmd);
  exec(cmd, function (err, out) {

    if (err) {
      console.log(err);
      return cb(err);
      // return cb(new pkgUtil.ChildError(ERRORS.TestsFailed, cmd, out, err.code));
    }

    console.log(MESSAGES.TestsPassed);
    perturb(settings, cb);
  });
}

function perturb (settings, done) {

  if (typeof settings === JS_TYPES.str) {
    settings = {rootDir: settings};
  }

  if (typeof settings === JS_TYPES.func) {
    done = settings;
    settings = null;
  }

  settings = settings || {};
  var meta = {};


  var config = assign(defaultConfig(), settings, {meta: meta});

  // TODO the ordering of config overriding is crap
  var userConfig;
  try {
    userConfig = require(config.rootDir + "/perturb-config");
  } catch (err) { /* check if it is indeed ENOENT? */ }
  assign(config, userConfig || {});
  // ewww...

  global.__perturb__ = config;

  var originalRootDir = config.rootDir;
  var originalSource = join(config.rootDir, config.sourceDir);
  var originalTest = join(config.rootDir, config.testDir);

  var perturbRootDir = join(originalRootDir, PERTURB_DIR);
  var perturbSourceDir = join(perturbRootDir, config.sourceDir);
  var perturbTestDir = join(perturbRootDir, config.testDir);

  config.matcher = config.matcher.bind(config);

  var shouldSymlink = pkgUtil.mapMirror([
    "node_modules",
  ]);

  // maybe remove this? if it exists, it indicates that cleanup is broken
  fs.removeSync(perturbRootDir);

  fs.mkdirSync(perturbRootDir);
  fs.copySync(originalSource, perturbSourceDir);
  fs.copySync(originalTest, perturbTestDir);

  fs.readdirSync(originalRootDir).forEach(function (item) {
    if (item in shouldSymlink) {
      fs.symlinkSync(join(originalRootDir, item), join(perturbRootDir, item));
    }
  });

  var perturbSourceFiles = glob.sync(perturbSourceDir + config.sourceGlob);
  var perturbTestFiles = glob.sync(perturbTestDir + config.testGlob);

  var matches = matchFiles(perturbSourceFiles, perturbTestFiles, config.matcher.bind(config));
  
  meta.matchesProcessed = matches.length;

  // should differentiate between user passed in config and interally used config.
  // otherwise, it's confusing what ends up where and there are replicated var names
  assign(config, {
    originalDir: originalRootDir,
    originalSourceDir: originalSource,
    originalTestDir: originalTest,

    perturbDir: perturbRootDir,
    perturbSourceDir: perturbSourceDir,
    perturbTestDir: perturbTestDir,
    perturbSourceFiles: perturbSourceFiles,
    perturbTestFiles: perturbTestFiles,

    matches: matches,
  });

  // only this should call done!
  function cleanup () {
    fs.removeSync(config.perturbDir);
    done.apply(null, arguments);
  }

  if (matches.length === 0) return cleanup(new Error(ERRORS.NoMatches));

  if (config.verbose) config.configReporter(config);

  var start = Date.now();

  async.mapSeries(matches, handleMatch, function (err, matches) {
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

function defaultConfig () {

  var config = {
    rootDir: process.cwd(),
    sourceDir: DEFAULT_SOURCE,
    testDir: DEFAULT_TEST,
    sourceGlob: DEFAULT_GLOB,
    testGlob: DEFAULT_GLOB,
    matcher: function defaultMatcher (sourceFile, testFile) {
      var sourceName = sourceFile.split(path.join(PERTURB_DIR, this.sourceDir)).pop();
      var testName = testFile.split(path.join(PERTURB_DIR, this.testDir)).pop();
      return sourceName === testName;
    },
    matcher2: function (sourceFile) {
      var sourceRelPath = path.join(PERTURB_DIR, this.sourceDir);
      var testRelPath = path.join(PERTURB_DIR, this.testDir);
      return sourceFile.replace(sourceRelPath, testRelPath);
    },
  };

  assign(config, reporters);

  return config;
}



module.exports = main;
