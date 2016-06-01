"use strict";

var NODE_TYPES = require("../constants/node-types");
var voidNode = require("../util/void-node");

// drops a function call made for side effects
// (the return value isn't assigned to a variable)
// (will this cause lots of test timeouts due to uncalled callbacks?)
module.exports = {
  name: "dropVoidCall",
  type: NODE_TYPES.ExpressionStatement,
  nodeType: NODE_TYPES.ExpressionStatement,
  filter (node) {
    if (node.getIn(["expression", "type"]) !== NODE_TYPES.CallExpression) {
      return false;
    }

    // skip method calls of objects since often called for side effects on `this`
    if (node.getIn(["callee", "type"]) !== NODE_TYPES.Identifier) {
      return false;
    }

  },
  mutator: voidNode,
};
