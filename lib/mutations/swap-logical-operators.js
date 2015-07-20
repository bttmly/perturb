var constants = require("../constants");
var NODE_TYPES = constants.NODE_TYPES;
var NODE_ATTRS = constants.NODE_ATTRS;

var AND = "&&";
var OR = "||";

module.exports = {
  // swaps && for || and vice versa
  // `if (x && y)` => `if (x || y)`
  // `while (f() || g())` => `while(f() && g())`
  name: "swapLogicalOperators",
  type: NODE_TYPES.LogicalExpression,
  mutator: function (node) {
    var prevOp = node.get(NODE_ATTRS.operator);
    var newOp = (prevOp === AND ? OR : AND);
    return node.set(NODE_ATTRS.operator, newOp);
  }
};
