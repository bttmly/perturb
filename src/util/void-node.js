"use strict";

var NODE_TYPES = require("../constants/node-types");
var Immutable = require("immutable");

var VOID = "void";
var VALUE = 0;
var RAW = String(VALUE);

function voidNode () {
  return Immutable.fromJS({
    type: NODE_TYPES.UnaryExpression,
    operator: VOID,
    argument: {
      type: NODE_TYPES.Literal,
      value: VALUE,
      raw: RAW,
    },
    prefix: true,
  });
}

module.exports = voidNode;
