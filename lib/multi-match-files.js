"use strict";

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

  return sourceFiles.map(function (sourceFile) {
    var tests = matcher.length === 1 ?
      runGenerativeMatcher(matcher, sourceFile) :
      runComparativeMatcher(matcher, sourceFile, testFiles);

    return {
      sourceFile: sourceFile,
      testFiles: tests,
    };
  });

  function runGenerativeMatcher (matchFn, source) {
    return Array(testFileMap[matchFn(source)] || 0);
  }

  function runComparativeMatcher (matchFn, source, tests) {
    return tests.filter(binaryPartial(matchFn, source));
  }
}




module.exports = matchFiles;
