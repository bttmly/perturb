"use strict";

var NODE_TYPES = require("../constants/node-types");
var NODE_ATTRS = require("../constants/node-attrs");

var AND = "&&";
var OR = "||";

// swaps && for || and vice versa
// `if (x && y)` => `if (x || y)`
// `while (f() || g())` => `while(f() && g())`
module.exports = {
  name: "swapLogicalOperators",
  type: NODE_TYPES.LogicalExpression,
  nodeType: NODE_TYPES.LogicalExpression,
  mutator (node) {
    var prevOp = node.get(NODE_ATTRS.operator);
    var newOp = (prevOp === AND ? OR : AND);
    return node.set(NODE_ATTRS.operator, newOp);
  },
};
