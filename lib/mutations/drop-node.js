"use strict";

var NODE_TYPES = require("../constant/node-types");
var voidNode = require("../util/void-node");

module.exports = {
  name: "dropNode",
  type: [
    NODE_TYPES.ContinueStatement,
    NODE_TYPES.BreakStatement,
  ],
  nodeTypes: [
    NODE_TYPES.ContinueStatement,
    NODE_TYPES.BreakStatement,
  ],
  mutator: voidNode,
};
