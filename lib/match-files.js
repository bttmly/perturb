"use strict";

// TODO implement at least one matcher that goes 1 source file => many test files
var path = require("path");

var flatten = require("lodash.flatten");

var mapMirror = require("./util/map-mirror");

// we consider two types of matching functions:
// 1. those which can generate the path of the test file
//    just by manipulating the path of the source file.
//    the signature is (sourcePath) => String testPath
//    (these are likely 1 source : 1 test)
//    we'll all these "generative matchers"
//
//
// 2. those which need the paths of both a source file
//    and a test file to determine if they match.
//    The signature is (sourcePath, testPath) => Boolean match
//    (these can implement any kind of many : many scheme)
//    we'll call these "comparative matchers"

function binaryPartial (f, a) {
  return function (b) {
    return f(a, b);
  };
}

function matchFiles (sourceFiles, testFiles, matcher) {
  var testFileMap = mapMirror(testFiles);

  // TODO: remove the flatten and for each source, run each test, looking for at least
  // one failure among them. This lets you write multiple test files for a single source
  // file
  return flatten(
    sourceFiles.map(function (sourceFile) {
      var tests = matcher.length === 1 ?
        runGenerativeMatcher(matcher, sourceFile) :
        runComparativeMatcher(matcher, sourceFile, testFiles);

      return tests.map(function (testFile) {
        return {
          testFile: testFile,
          sourceFile: sourceFile,
          testToSourceRelative: path.relative(path.dirname(testFile), sourceFile),
        };
      });
    })
  );

  function runGenerativeMatcher (matchFn, source) {
    return Array(testFileMap[matchFn(source)] || 0);
  }

  function runComparativeMatcher (matchFn, source, tests) {
    return tests.filter(binaryPartial(matchFn, source));
  }
}




module.exports = matchFiles;
