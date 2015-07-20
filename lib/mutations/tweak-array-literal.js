var constants = require("../constants");
var NODE_TYPES = constants.NODE_TYPES;
var NODE_ATTRS = constants.NODE_ATTRS;

module.exports = {
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweakArrayLiteral",
  type: NODE_TYPES.ArrayExpression,
  filter: function (node) {
    return node.get(NODE_ATTRS.elements).size !== 0;

  },
  mutator: function (node) {
    return arrayLiteralTweakFn(node);
  }
};
