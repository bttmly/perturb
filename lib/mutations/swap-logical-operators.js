"use strict";

var NODE_TYPES = require("../constant/node-types");
var NODE_ATTRS = require("../constant/node-attrs");

var AND = "&&";
var OR = "||";

// swaps && for || and vice versa
// `if (x && y)` => `if (x || y)`
// `while (f() || g())` => `while(f() && g())`
module.exports = {
  name: "swapLogicalOperators",
  type: NODE_TYPES.LogicalExpression,
  nodeType: NODE_TYPES.LogicalExpression,
  mutator: function (node) {
    var prevOp = node.get(NODE_ATTRS.operator);
    var newOp = (prevOp === AND ? OR : AND);
    return node.set(NODE_ATTRS.operator, newOp);
  },
};
