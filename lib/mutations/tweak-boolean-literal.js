var constants = require("../constants");
var NODE_TYPES = constants.NODE_TYPES;
var NODE_ATTRS = constants.NODE_ATTRS;

module.exports = {
  name: "tweakBooleanLiteral",
  type: NODE_TYPES.Literal,
  nodeType: NODE_TYPES.Literal,
  filter: function (node) {
    return isBoolean(node.get(NODE_ATTRS.value));
  },
  mutator: function (node) {
    return booleanLiteralTweakFn(node);
  }
};
