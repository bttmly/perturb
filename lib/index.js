var path = require("path");

var fs = require("fs-extra");
var assign = require("object-assign");
var glob = require("glob");
var find = require("lodash.find");

var handleMatch = require("./handle-match");
// var defaultReporter = require("./default-reporter");

var defaultReporter = Function();

function defaultConfig () {
  return {
    sharedParent: process.cwd(),
    sourceDir: "lib",
    testDir: "test",
    sourceGlob: "/**/*.js",
    testGlob: "/**/*.js",
    reporter: defaultReporter,
    tempTest: ".perturb-test",
    tempSource: ".perturb-source",
    matcher: function (sourceFile) {
      return sourceFile.replace(".js", "-test.js");
    },
    cleanup: false
  };
}

function resolveConfig (c) {
  c.sharedParent = path.resolve(c.sharedParent);
  
  c.testDir = path.join(c.sharedParent, c.testDir);
  c.testFiles = glob.sync(c.testDir + c.testGlob);
  
  c.sourceDir = path.join(c.sharedParent, c.sourceDir);
  c.sourceFiles = glob.sync(c.sourceDir + c.sourceGlob);
  
  c.tempTest = path.join(c.sharedParent, c.tempTest);
  c.tempSource = path.join(c.sharedParent, c.tempSource);
  
  return c;
}

function matchFiles (c) {
  var allTests = c.testFiles.map(function (t) {
    return {
      full: t,
      shortened: t.replace(c.testDir, "").slice(1)
    };
  });

  var allSources = c.sourceFiles.map(function (s) {
    return {
      full: s,
      shortened: s.replace(c.sourceDir, "").slice(1)
    };
  });

  var matches = allTests.reduce(function (matches, t) {
    var s = find(allSources, function (o) {
      return c.matcher(t.full, o);
    });
    if (s) {
      matches.push({
        testDir: c.testDir,
        testFull: t.full,
        testShortened: t.shortened,
        sourceDir: c.sourceDir,
        sourceFull: s.full,
        sourceShortened: s.shortened,
        testToSourceRelative: path.relative(path.dirname(t.full), s.full)
      });
    }
    return matches;
  }, []);

  return matches;
}

function main (settings) {
  settings = settings || {};
  var config = assign(defaultConfig(), settings);
  resolveConfig(config);
  var matches = matchFiles(config);
  fs.copySync(config.sourceDir, config.tempSource);
  fs.copySync(config.testDir, config.tempTest);

  console.log(matches);

  matches.forEach(handleMatch);

}

module.exports = main;