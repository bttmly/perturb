var constants = require("../constants");
var NODE_TYPES = constants.NODE_TYPES;
var NODE_ATTRS = constants.NODE_ATTRS;
var NODES_WITH_TEST = constants.NODES_WITH_TEST;

module.exports = {
  // inverts a conditional test with a bang
  // `if (isReady) {}` => `if (!(isReady)) {}`
  // `while (arr.length) {} => `while(!(arr.length)) {}`
  // `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
  name: "invertConditionalTest",
  type: Object.keys(constants.NODES_WITH_TEST),
  nodeTypes: Object.keys(constants.NODES_WITH_TEST),
  filter: function (node) {
    return node.has(NODE_ATTRS.test);
  },
  mutator: function (node) {
    return node.set(NODE_ATTRS.test, IMap({
      type: NODE_TYPES.UnaryExpression,
      operator: BANG,
      argument: node.get(NODE_ATTRS.test)
    }));
  }
};
