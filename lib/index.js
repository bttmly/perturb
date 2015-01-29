"use strict";

// bad stuff
Error.stackTraceLimit = 100;
process.setMaxListeners(0);

var EventEmitter = require("events").EventEmitter;
var path = require("path");

var npm = require("npm");
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

var join = path.join;

var DEFAULT_SOURCE = "lib";
var DEFAULT_TEST = "test";
var PERTURB_DIR = ".perturb";
var DEFAULT_GLOB = "/**/*.js";

// module.exports = function (settings, cb) {
//   npm.commands['run-script']("test", perturb.bind(null, settings, cb));
// };

module.exports = perturb;
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

  var oRoot = config.rootDir;
  var oSource = join(oRoot, config.sourceDir);
  var oTest = join(oRoot, config.testDir);

  var pRoot = join(oRoot, PERTURB_DIR);
  var pSource = join(pRoot, config.sourceDir);
  var pTest = join(pRoot, config.testDir);

  config.matcher = config.matcher.bind(config);
  var blacklist = util.mapMirror([
    PERTURB_DIR,
    config.sourceDir,
    config.testDir
  ]);

  var shouldSymlink = util.mapMirror([
    "node_modules"
  ]);

  fs.removeSync(pRoot);
  fs.mkdirSync(pRoot);
  fs.copySync(oSource, pSource);
  fs.copySync(oTest, pTest);

  fs.readdirSync(oRoot).forEach(function (item) {
    // if (!(item in shouldSymlink)) return;
    if (item in blacklist) return;
    fs.symlinkSync(join(oRoot, item), join(pRoot, item));
  });

  var pSources = glob.sync(pSource + config.sourceGlob);
  var pTests = glob.sync(pTest + config.testGlob);
  var matches = perturbMatch(pSources, pTests, config.matcher.bind(config));

  console.log(assign(config, {
    originalDir: oRoot,
    originalSourceDir: oSource,
    originalTestDir: oTest,

    perturbDir: pRoot,
    perturbSourceDir: pSource,
    perturbTestDir: pTest,
    perturbSourceFiles: pSources,
    perturbTestFiles: pTests,

    matches: matches
  }));

  meta.matchesProcessed = matches.length;

  var start = process.hrtime();


  async.mapSeries(matches, handleMatch, function (err, matches) {
    if (err) return cb(err);
    var diff = process.hrtime(start);

    meta.duration = (diff[0] * 1e9 + diff[1]) / 1e6;
    meta.errored = !!err;
    meta.mutationCount = util.countAllMutants(matches);
    meta.killedMutants = util.countDeadMutants(matches);

    fs.removeSync(config.perturbDir);

    cb(null, {
      meta: meta,
      config: config,
      matches: matches
    });

  });
}

function defaultConfig () {
  return {
    rootDir: process.cwd(),
    sourceDir: DEFAULT_SOURCE,
    testDir: DEFAULT_TEST,
    sourceGlob: DEFAULT_GLOB,
    testGlob: DEFAULT_GLOB,
    reporter: reporters.defaultReporter,
    matcher: function defaultMatcher (sourceFile, testFile) {
      var sName = sourceFile
        .split(path.join(PERTURB_DIR, this.sourceDir))
        .pop();

      var tName = testFile
        .split(path.join(PERTURB_DIR, this.testDir))
        .pop();

      return sName.replace(".js", "-test.js") === tName;
    },
  };
}

function perturbMatch (sourceFiles, testFiles, matcher) {
  return testFiles.reduce(function (matches, tName) {
    var sName = find(sourceFiles, function (sName) {
      return matcher(sName, tName);
    });

    if (sName) {
      matches.push({
        testFile: tName,
        sourceFile: sName,
        testToSourceRelative: path.relative(path.dirname(tName), sName)
      });
    }
    return matches;
  }, []);
}
