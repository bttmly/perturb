"use strict";

var NODE_TYPES = require("../constant/node-types");
var NODE_ATTRS = require("../constant/node-attrs");

module.exports = {
  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  name: "tweakObjectLiteral",
  type: NODE_TYPES.ObjectExpression,
  nodeType: NODE_TYPES.ObjectExpression,
  filter: function (node) {
    return node.get(NODE_ATTRS.properties).size !== 0;
  },
  mutator: function (node) {
    return objectLiteralTweakFn(node);
  }
};

function objectLiteralTweakFn (node) {
  return node.set(NODE_ATTRS.properties, node.get(NODE_ATTRS.properties).slice(1));
}
