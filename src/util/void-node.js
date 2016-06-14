"use strict";

const Immutable = require("immutable");

const NODE_TYPES = require("../constants/node-types");

const VOID = "void";
const VALUE = 0;
const RAW = String(VALUE);

const NODE = Immutable.fromJS({
  type: NODE_TYPES.UnaryExpression,
  operator: VOID,
  argument: {
    type: NODE_TYPES.Literal,
    value: VALUE,
    raw: RAW,
  },
  prefix: true,
})

function voidNode () {
  return NODE;
}

module.exports = voidNode;
