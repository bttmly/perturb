var constants = require("../constants");
var NODE_TYPES = constants.NODE_TYPES;
var NODE_ATTRS = constants.NODE_ATTRS;

module.exports = {
  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  name: "tweakObjectLiteral",
  type: NODE_TYPES.ObjectExpression,
  nodeType: NODE_TYPES.ObjectExpression,
  filter: function (node) {
    return node.get(NODE_ATTRS.properties).size !== 0;
  },
  mutator: function (node) {
    return objectLiteralTweakFn(node);
  }
};
