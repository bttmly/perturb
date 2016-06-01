"use strict";

var BINARY_OPERATOR_SWAPS = require("../constants/binary-operator-swaps");
var NODE_TYPES = require("../constants/node-types");
var NODE_ATTRS = require("../constants/node-attrs");

var NO_SWAP = require("../util/map-mirror")([
  "instanceof",
  "in",
]);

// swaps [+, -] and [*, /]
// `age = age + 1;` => `age = age - 1;`
// `var since = new Date() - start;` => `var since = new Date() + start;`
// `var dy = rise / run;` => `var dy = rise * run;`
// `var area = w * h;` => `var area = w / h;`
module.exports = {
  name: "swapBinaryOperators",
  type: NODE_TYPES.BinaryExpression,
  nodeType: NODE_TYPES.BinaryExpression,
  mutator (node) {
    var prevOp = node.get(NODE_ATTRS.operator);
    var newOp = BINARY_OPERATOR_SWAPS[prevOp];
    return node.set(NODE_ATTRS.operator, newOp);
  },
  filter (node) {
    return !(node.get(NODE_ATTRS.operator) in NO_SWAP);
  },
};
