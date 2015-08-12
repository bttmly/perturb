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


// type      GenerativeMatcher (a) -> String
// type      ComparativeMatcher (a, b) -> Bool
// type      Match {sourceFile: String, testFiles: []String}

// param     sourceFiles []String
// param     testFiles []String
// param     matcher GenerativeMatcher | ComparativeMatcher
// returns   []Match
function matchFiles (sourceFiles, testFiles, matcher) {
  return sourceFiles
    .map(function (sourceFile) {
      var tests = matcher.length === 1 ?
        runGenerativeMatcher(matcher, sourceFile, mapMirror(testFiles)) :
        runComparativeMatcher(matcher, sourceFile, testFiles);

      return {
        sourceFile: sourceFile,
        testFiles: tests,
      };
    })
    .filter(function (match) {
      return match.testFiles.length;
    });
}

function runGenerativeMatcher (matchFn, source, fileMap) {
  var test = fileMap[matchFn(source)];
  return test ? [test] : [];
}

function runComparativeMatcher (matchFn, source, tests) {
  return tests.filter(binaryPartial(matchFn, source));
}



module.exports = matchFiles;
