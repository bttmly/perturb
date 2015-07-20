var BINARY_OPERATOR_SWAPS = require("../constant/binary-operator-swaps");
var NODE_TYPES = require("../constant/node-types");
var NODE_ATTRS = require("../constant/node-attrs");

module.exports = {
  // swaps [+, -] and [*, /]
  // `age = age + 1;` => `age = age - 1;`
  // `var since = new Date() - start;` => `var since = new Date() + start;`
  // `var dy = rise / run;` => `var dy = rise * run;`
  // `var area = w * h;` => `var area = w / h;`
  name: "swapBinaryOperators",
  type: NODE_TYPES.BinaryExpression,
  mutator: function (node) {
    var prevOp = node.get(NODE_ATTRS.operator);
    var newOp = BINARY_OPERATOR_SWAPS[prevOp];
    return node.set(NODE_ATTRS.operator, newOp);
  }
};
