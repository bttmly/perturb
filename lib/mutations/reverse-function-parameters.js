var constants = require("../constants");
var NODE_ATTRS = constants.NODE_ATTRS;
var FUNC_NODES = constants.FUNC_NODES;

module.exports = {
  // reverse the perameter order for a function expression or declaration
  // `function fn (a, b)` {} => `function fn (b, a)`
  name: "reverseFunctionParameters",
  type: Object.keys(constants.FUNC_NODES),
  nodeTypes: Object.keys(constants.FUNC_NODES),
  filter: function (node) {
    return node.get(NODE_ATTRS.params).size > 1;
  },
  mutator: function (node) {
    return node.set(NODE_ATTRS.params, node.get(NODE_ATTRS.params).reverse());
  }
}
