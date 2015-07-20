"use strict";

var NODE_TYPES = require("../constant/node-types");
var NODE_ATTRS = require("../constant/node-attrs");

module.exports = {
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweakArrayLiteral",
  type: NODE_TYPES.ArrayExpression,
  filter: function (node) {
    return node.get(NODE_ATTRS.elements).size !== 0;

  },
  mutator: function (node) {
    return arrayLiteralTweakFn(node);
  }
};
