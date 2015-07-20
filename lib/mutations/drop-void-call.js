"use strict";

var NODE_TYPES = require("../constants/node-type");
var voidNode = require("../util/void-node");

module.exports = {
  // drops a function call made for side effects
  // (the return value isn't assigned to a variable)
  // (will this cause lots of test timeouts due to uncalled callbacks?)
  name: "dropVoidCall",
  type: NODE_TYPES.ExpressionStatement,
  filter: function (node) {
    if (node.getIn(["expression", "type"]) !== NODE_TYPES.CallExpression) {
      return false;
    }

    // skip method calls of objects since often called for side effects on `this`
    if (node.getIn(["callee", "type"]) !== NODE_TYPES.Identifier) {
      return false;
    }

  },
  mutator: voidNode
};
