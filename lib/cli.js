"use strict";

var path = require("path");

var perturb = require("./");
var util = require("./util");

var exampleDir = path.join(__dirname, "../example");

perturb({sharedParent: exampleDir}, function (err, data) {
  if (err) throw err;


  data.forEach(function (match) {

    match.mutations
      .filter(mutantIsAlive)
      .map(util.prettyDiff)
      .forEach(function (str) {
        console.log(str);
      });

  });
});

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

function mutantIsAlive (mutant) {
  return mutant.passed.length && !mutant.failed.length;
}

function countAllMutants (matches) {
  return mutantCount(matches, function () { return true; });
}

function countAliveMutants (matches) {
  return mutantCount(matches, mutantIsAlive);
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