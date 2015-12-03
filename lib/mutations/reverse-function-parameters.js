"use strict";

var NODE_ATTRS = require("../constant/node-attrs");
var FUNC_NODES = require("../constant/func-nodes");

// reverse the perameter order for a function expression or declaration
// `function fn (a, b) {}` => `function fn (b, a) {}`
module.exports = {
  name: "reverseFunctionParameters",
  type: Object.keys(FUNC_NODES),
  nodeTypes: Object.keys(FUNC_NODES),
  filter: function (node) {
    return node.get(NODE_ATTRS.params).size > 1;
  },
  mutator: function (node) {
    return node.set(NODE_ATTRS.params, node.get(NODE_ATTRS.params).reverse());
  },
};
