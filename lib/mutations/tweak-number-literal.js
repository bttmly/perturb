"use strict";

var NODE_TYPES = require("../constant/node-types");
var NODE_ATTRS = require("../constant/node-attrs");

var setNodeValue = require("../util/set-node-value");
var isNumber = require("../util/is-number");

module.exports = {
  // adds 1 to any number literal OR replaces 1 with 0
  // var num = 0; => var num = 1;
  // var x = 735; => var x = 736;
  name: "tweakNumberLiteral",
  type: NODE_TYPES.Literal,
  nodeType: NODE_TYPES.Literal,
  filter: function (node) {
    return isNumber(node.get(NODE_ATTRS.value));
  },
  mutator: function (node) {
    return numberLiteralTweakFn(node);
  }
};

function numberLiteralTweakFn (node) {
  var value = node.get(NODE_ATTRS.value);
  return setNodeValue(node, (value === 1 ? 0 : value + 1));
}
