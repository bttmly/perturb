"use strict";

var isString = require("../util/is-string");
var setNodeValue = require("../util/set-node-value");

var NODE_TYPES = require("../constants/node-types");
var NODE_ATTRS = require("../constants/node-attrs");

module.exports = {
  // drops first character of non-empty string; changes
  // empty strings to "a"
  // var s = ""; => var s = "a";
  // var name = "nick"; => var name = "ick";
  name: "tweakStringLiteral",
  type: NODE_TYPES.Literal,
  nodeType: NODE_TYPES.Literal,
  filter (node) {
    return isString(node.get(NODE_ATTRS.value));
  },
  mutator (node) {
    return stringLiteralTweakFn(node);
  },
};

function stringLiteralTweakFn (node) {
  var value = node.get(NODE_ATTRS.value);
  return setNodeValue(node, value.length ? value.slice(1) : "a");
}
