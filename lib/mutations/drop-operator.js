var constants = require("../constants");
var NODE_TYPES = constants.NODE_TYPES;
var NODE_ATTRS = constants.NODE_ATTRS;

module.exports = {
  // throw new Error(); => new Error();
  // delete obj.x; => obj.x;
  // typeof obj; => obj;
  // +new Date(); => new Date();
  name: "dropOperator",
  type: [
    NODE_TYPES.ThrowStatement,
    NODE_TYPES.UnaryExpression
  ],
  nodeTypes: [
    NODE_TYPES.ThrowStatement,
    NODE_TYPES.UnaryExpression
  ],
  mutator: function (node) {
    return node.get(NODE_ATTRS.argument);
  }
};
