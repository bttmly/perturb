"use strict";

var assertType = require("../util/assert-type");
var JS_TYPES = require("../constant/js-types");

function assertTypeAtKey (type, target) {
  var assertion = assertType(type);
  return function (key) {
    assertion(target[key]);
  };
}

function assertValidConfig (config) {

  var strKeys = [
    "rootDir",
    "sourceDir",
    "testDir",
    "sourceGlob",
    "testGlob",
    "perturbDirName",
    "originalSourceDir",
    "originalTestDir",
    "perturbRoot",
    "perturbSourceDir",
    "perturbTestDir",
  ];

  var funcKeys = [
    "mutantReporter",
    "matcher",
    // "runner",
  ];

  strKeys.forEach(assertTypeAtKey(JS_TYPES.str, config));
  funcKeys.forEach(assertTypeAtKey(JS_TYPES.func, config));
}

module.exports = assertValidConfig;
