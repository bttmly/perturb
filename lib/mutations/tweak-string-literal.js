var constants = require("../constants");
var NODE_TYPES = constants.NODE_TYPES;
var NODE_ATTRS = constants.NODE_ATTRS;

module.exports = {
  // drops first character of non-empty string; changes
  // empty strings to "a"
  // var s = ""; => var s = "a";
  // var name = "nick"; => var name = "ick";
  name: "tweakStringLiteral",
  type: NODE_TYPES.Literal,
  nodeType: NODE_TYPES.Literal,
  filter: function (node) {
    return isString(node.get(NODE_ATTRS.value));
  },
  mutator: function (node) {
    return stringLiteralTweakFn(node);
  }
}
