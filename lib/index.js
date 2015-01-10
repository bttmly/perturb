"use strict";

var path = require("path");

var async = require("async");
var fs = require("fs-extra");
var assign = require("object-assign");
var glob = require("glob");
var find = require("lodash.find");

var handleMatch = require("./handle-match");
var util = require("./util");


var join = path.join;

module.exports = main;
function main (settings) {

  if (typeof settings === "string") {
    settings = {sharedParent: settings};
  }

  settings = settings || {};
  var config = assign(defaultConfig(), settings);

  var parent = config.sharedParent;

  var source = join(parent, config.sourceDir);
  var test = join(parent, config.testDir);
  var perturb = join(parent, ".perturb");
  var pSource = join(perturb, config.sourceDir);
  var pTest = join(perturb, config.testDir);

  var BLACKLIST = util.mapMirror([".perturb", config.sourceDir, config.testDir]);

  fs.removeSync(perturb);
  fs.mkdirSync(perturb);
  fs.copySync(source, pSource);
  fs.copySync(test, pTest);

  fs.readdirSync(parent).forEach(function (file) {
    if (file in BLACKLIST) return;
    fs.symlinkSync(join(parent, file), join(perturb, file));
  });

  var pSources = glob.sync(pSource + config.sourceGlob);
  var pTests = glob.sync(pTest + config.testGlob);
  var matches = perturbMatch(pSources, pTests, config.matcher);

  async.mapSeries(matches, handleMatch, function (err, data) {
    if (err) throw err;
    console.log(countAllMutants(data));
    console.log(countAliveMutants(data));
  });
}


function mutantCount (matches, callback) {
  var count = 0;
  matches.forEach(function (match) {
    match.mutations.forEach(function (mutant) {
      if (callback(mutant)) {
        count += 1;
      }
    });
  });
  return count;
}

function countAllMutants (matches) {
  return mutantCount(matches, function () { return true; });
}

function countAliveMutants (matches) {
  return mutantCount(matches, function (m) {
    return m.passed.length && !m.failed.length;
  });
}

function defaultConfig () {
  return {
    sharedParent: process.cwd(),
    sourceDir: "lib",
    testDir: "test",
    sourceGlob: "/**/*.js",
    testGlob: "/**/*.js",
    reporter: function () {},
    matcher: function (sourceFile, testFile) {
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