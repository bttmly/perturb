"use strict";

var NODE_TYPES = require("../constant/node-types");
var NODE_ATTRS = require("../constant/node-attrs");

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
  mutator: function (node) {
    return node.get(NODE_ATTRS.argument);
  },
};
