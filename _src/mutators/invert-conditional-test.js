"use strict";

var NODE_TYPES = require("../constants/node-types");
var NODE_ATTRS = require("../constants/node-attrs");
var TEST_NODES = require("../constants/test-nodes");
var IMap = require("immutable").Map;

var BANG = "!";

// inverts a conditional test with a bang
// `if (isReady) {}` => `if (!(isReady)) {}`
// `while (arr.length) {} => `while(!(arr.length)) {}`
// `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
module.exports = {
  name: "invertConditionalTest",
  type: Object.keys(TEST_NODES),
  nodeTypes: Object.keys(TEST_NODES),
  filter (node) {
    // using get() over has() ensures it isn't null (switch case `default`!)
    return node.get(NODE_ATTRS.test);
  },
  mutator (node) {
    return node.set(NODE_ATTRS.test, IMap({
      type: NODE_TYPES.UnaryExpression,
      operator: BANG,
      argument: node.get(NODE_ATTRS.test),
    }));
  },
};
