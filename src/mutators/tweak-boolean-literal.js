"use strict";

var NODE_TYPES = require("../constants/node-types");
var NODE_ATTRS = require("../constants/node-attrs");

var setNodeValue = require("../util/set-node-value");
var isBoolean = require("../util/is-boolean");

// `var isOk = true` => `var isOk = false`
module.exports = {
  name: "tweakBooleanLiteral",
  type: NODE_TYPES.Literal,
  nodeType: NODE_TYPES.Literal,
  filter (node) {
    return isBoolean(node.get(NODE_ATTRS.value));
  },
  mutator (node) {
    return booleanLiteralTweakFn(node);
  },
};

function booleanLiteralTweakFn (node) {
  return setNodeValue(node, !node.get(NODE_ATTRS.value));
}
