"use strict";

var assert = require("assert");
var util = require("util");

function wrapWithArgumentAssertions (fn) {
  var assertions = [].slice.call(arguments, 1);
  assertions.map(assertType("function"));
  return function () {
    var args = [].slice.call(arguments);
    assertions.forEach(function (assertion, i) {
      assertion(args[i]);
    });
    return fn.apply(this, args);
  };
}

function wrapWithReturnAssertion (fn, assertion) {
  return function () {
    var result = fn.apply(this, arguments);
    assertion(result);
    return result;
  };
}

function assertType (type) {
  return function (target) {
    assert(typeof target === type, util.format("Expected %s to be of type %s", target, type));
  };
}

module.exports = {
  wrapWithArgumentAssertions: wrapWithArgumentAssertions,
  wrapWithReturnAssertion: wrapWithReturnAssertion,
};
