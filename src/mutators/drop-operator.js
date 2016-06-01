"use strict";

var NODE_TYPES = require("../constants/node-types");
var NODE_ATTRS = require("../constants/node-attrs");

// throw new Error(); => new Error();
// delete obj.x; => obj.x;
// typeof obj; => obj;
// +new Date(); => new Date();
module.exports = {
  name: "dropOperator",
  type: [
    NODE_TYPES.ThrowStatement,
    NODE_TYPES.UnaryExpression,
  ],
  nodeTypes: [
    NODE_TYPES.ThrowStatement,
    NODE_TYPES.UnaryExpression,
  ],
  mutator (node) {
    return node.get(NODE_ATTRS.argument);
  },
};
