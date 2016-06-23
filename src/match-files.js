"use strict";

var R = require("ramda");
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

// GenerativeMatcher (source: String) -> test: String
// ComparativeMatcher (source: String, test: String) -> didMatch: Boolean

/*
type Config {
  matcher: GenerativeMatcher | ComparativeMatcher
  runner: Mutation -> Promise<Result>
}
*/

// matchFiles :: Config -> [FileName] -> [FileName] -> [Match]
module.exports = R.curry(function matchFiles (config, sources, tests) {

  const testMap = mapMirror(tests);
  const {matcher} = config;
  return sources.map(source => ({
    source,
    tests: matcher.length === 1 ? 
      runGenerativeMatcher(matcher, source, testMap) :
      runComparativeMatcher(matcher, source, tests),
    runner: config.runner,
  }));
});

function runGenerativeMatcher (generateTestName, source, tests) {
  const name = generateTestName(source);
  if (!tests.hasOwnProperty(name)) return [];
  return [tests[name]];
}

function runComparativeMatcher (isMatch, source, tests) {
  return tests.filter(t => isMatch(source, t));
}

