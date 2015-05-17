"use strict";

// bad stuff
// Error.stackTraceLimit = 100;
// process.setMaxListeners(0);

var path = require("path");
var exec = require("child_process").exec;

var async = require("async");
var fs = require("fs-extra");
var glob = require("glob");
var find = require("lodash.find");
var assign = require("object-assign");

var handleMatch = require("./handle-match");
var reporters = require("./reporters");
var util = require("./util");
var constants = require("./constants");

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
      return cb(new util.ChildError(ERRORS.TestsFailed, cmd, out, err.code));
    }

    console.log(MESSAGES.TestsPassed);
    perturb(settings, cb);
  });
}

function perturb (settings, cb) {

  if (typeof settings === JS_TYPES.str) {
    settings = {rootDir: settings};
  }

  if (typeof settings === JS_TYPES.func) {
    cb = settings;
    settings = null;
  }

  settings = settings || {};
  var meta = {};
  var config = assign(defaultConfig(), settings, {meta: meta});

  global.__perturb__ = config;

  var originalRootDir = config.rootDir;
  var originalSource = join(config.rootDir, config.sourceDir);
  var originalTest = join(config.rootDir, config.testDir);

  var perturbRootDir = join(originalRootDir, PERTURB_DIR);
  var perturbSourceDir = join(perturbRootDir, config.sourceDir);
  var perturbTestDir = join(perturbRootDir, config.testDir);

  config.matcher = config.matcher.bind(config);

  var shouldSymlink = util.mapMirror([
    "node_modules"
  ]);

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

  var matches = perturbMatch(perturbSourceFiles, perturbTestFiles, config.matcher.bind(config));

  if (matches.length === 0) return cb(new Error(ERRORS.NoMatches));

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

    matches: matches
  });

  if (config.verbose) config.configReporter(config);

  // var start = process.hrtime();
  var start = Date.now();

  async.mapSeries(matches, handleMatch, function (err, matches) {
    if (err) return cb(err);

    meta.duration = Date.now() - start;
    meta.errored = !!err;
    meta.mutationCount = util.countAllMutants(matches);
    meta.killedMutants = util.countDeadMutants(matches);
    meta.killRate = meta.killedMutants / meta.mutationCount;

    fs.removeSync(config.perturbDir);

    var report = {
      meta: meta,
      config: config,
      matches: matches
    };

    cb(null, report);

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
    }
  };

  assign(config, reporters);

  return config;
}

function perturbMatch (sourceFiles, testFiles, matcher) {
  var testFileMap = util.mapMirror(testFiles);

  return sourceFiles.reduce(function (matches, sourceFile) {
    var testFile = matcher.length === 1 ?
      testFileMap[matcher(sourceFile)] :
      find(testFiles, function (t) {
        return matcher(sourceFile, t);
      });

    if (testFile) {
      matches.push({
        testFile: testFile,
        sourceFile: sourceFile,
        testToSourceRelative: path.relative(path.dirname(testFile), sourceFile)
      });
    }

    return matches;
  }, []);
}

module.exports = main;
