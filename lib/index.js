"use strict";
var path = require("path");

var async = require("async");
var fs = require("fs-extra");
var assign = require("object-assign");
var glob = require("glob");
var find = require("lodash.find");
var _ = require("lodash");

var handleMatch = require("./handle-match");
var reporters = require("./reporters");
var util = require("./util");

var join = path.join;

var DEFAULT_SOURCE = "lib";
var DEFAULT_TEST = "test";
var PERTURB_DIR = ".perturb";
var DEFAULT_GLOB = "/**/*.js";

module.exports = perturb;

function perturb (settings, cb) {

  if (typeof settings === "string") {
    settings = {rootDir: settings};
  }

  if (typeof settings === "function") {
    cb = settings;
    settings = null;
  }

  settings = settings || {};
  var config = assign(defaultConfig(), settings);

  var meta = {
    startedAt: new Date()
  };

  config.meta = meta;

  var parent = config.rootDir;

  var source = join(parent, config.sourceDir);
  var test = join(parent, config.testDir);
  var perturb = join(parent, PERTURB_DIR);
  var pSource = join(perturb, config.sourceDir);
  var pTest = join(perturb, config.testDir);

  var blacklist = util.mapMirror([PERTURB_DIR, config.sourceDir, config.testDir]);

  fs.removeSync(perturb);
  fs.mkdirSync(perturb);
  fs.copySync(source, pSource);
  fs.copySync(test, pTest);

  fs.readdirSync(parent).forEach(function (file) {
    if (file in blacklist) return;
    fs.symlinkSync(join(parent, file), join(perturb, file));
  });

  var pSources = glob.sync(pSource + config.sourceGlob);
  var pTests = glob.sync(pTest + config.testGlob);
  var matches = perturbMatch(pSources, pTests, config.matcher);

  meta.matchCount = matches.length;

  async.mapSeries(matches, handleMatch, function (err, matches) {
    if (err) return cb(err);
    
    meta.endedAt = new Date();
    meta.errored = !!err;
    meta.duration = meta.endedAt - meta.startedAt;
    meta.mutationCount = util.countAllMutants(matches);
    meta.killedMutants = 
      util.countAllMutants(matches) - util.countAliveMutants(matches);

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
    matcher: function (sourceFile, testFile) {
      var sName = sourceFile.split([PERTURB_DIR, DEFAULT_SOURCE].join("/"))
      var sName = sourceFile.split(".perturb/lib").pop();
      var tName = testFile.split(".perturb/test").pop();
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