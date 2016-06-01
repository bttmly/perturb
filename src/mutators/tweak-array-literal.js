"use strict";

var NODE_TYPES = require("../constants/node-types");
var NODE_ATTRS = require("../constants/node-attrs");

module.exports = {
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweakArrayLiteral",
  type: NODE_TYPES.ArrayExpression,
  nodeType: NODE_TYPES.ArrayExpression,
  filter (node) {
    return node.get(NODE_ATTRS.elements).size !== 0;

  },
  mutator (node) {
    return arrayLiteralTweakFn(node);
  },
};

function arrayLiteralTweakFn (node) {
  return node.set(NODE_ATTRS.elements, node.get(NODE_ATTRS.elements).slice(1));
}
