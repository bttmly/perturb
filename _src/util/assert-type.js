"use strict";

var util = require("util");
var assert = require("assert");

function assertType (type) {
  return function (value) {
    assert(typeof value === type,
      util.format("Expected %s to be of type %s", value, type));
  };
}

module.exports = assertType;
