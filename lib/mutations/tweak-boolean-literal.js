"use strict";

var NODE_TYPES = require("../constant/node-types");
var NODE_ATTRS = require("../constant/node-attrs");

module.exports = {
  name: "tweakBooleanLiteral",
  type: NODE_TYPES.Literal,
  nodeType: NODE_TYPES.Literal,
  filter: function (node) {
    return isBoolean(node.get(NODE_ATTRS.value));
  },
  mutator: function (node) {
    return booleanLiteralTweakFn(node);
  }
};
