var path = require("path");

var async = require("async");
var fs = require("fs-extra");
var assign = require("object-assign");
var glob = require("glob");
var find = require("lodash.find");

var handleMatch = require("./handle-match");
// var defaultReporter = require("./default-reporter");

var defaultReporter = Function();

var join = path.join.bind(path);

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
    matcher: function (sourceFile, testFile) {
      var sName = sourceFile.split(".perturb/lib").pop();
      var tName = testFile.split(".perturb/test").pop();
      return sName.replace(".js", "-test.js") === tName;
    },
    cleanup: false
  };
}

// function resolveConfig (c) {
//   c.sharedParent = path.resolve(c.sharedParent);
  
//   c.fullTestDir = join(c.sharedParent, c.testDir);
//   c.testFiles = glob.sync(c.testDir + c.testGlob);
  
//   c.fullSourceDir = join(c.sharedParent, c.sourceDir);
//   c.sourceFiles = glob.sync(c.sourceDir + c.sourceGlob);
  
//   c.tempTest = join(c.sharedParent, c.tempTest);
//   c.tempSource = join(c.sharedParent, c.tempSource);
  
//   return c;
// }

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

  var blacklist = [".perturb"].concat([config.sourceDir, config.testDir]);

  fs.removeSync(perturb);
  fs.mkdirSync(perturb);
  fs.copySync(source, pSource);
  fs.copySync(test, pTest);

  fs.readdirSync(parent).forEach(function (file) {
    if (blacklist.indexOf(file) !== -1) return;
    fs.symlinkSync(join(parent, file), join(perturb, file));
  });

  var pSources = glob.sync(pSource + config.sourceGlob);
  var pTests = glob.sync(pTest + config.testGlob);
  var matches = perturbMatch(pSources, pTests, config.matcher);

  console.log(matches);

  async.each(matches, handleMatch, function (err) {
    if (err) throw err;
    console.log("All done!");
  });

}

module.exports = main;