var NODE_TYPES = require("../constant/node-types");
var NODE_ATTRS = require("../constant/node-attrs");
var IMap = require("immutable").Map;

module.exports = {
  // drop return w/o affecting the rest of the expression/statement
  // if return statement has no argument, instead transform it into `void 0;`
  // `return something;` => `something;`
  // `return;` => `void 0;`
  name: "dropReturn",
  type: NODE_TYPES.ReturnStatement,
  mutator: function (node) {
    var arg = node.get(NODE_ATTRS.argument);

    if (arg) {
      return IMap({
        type: NODE_TYPES.ExpressionStatement,
        expression: arg
      });
    }

    return voidNode();
  }
};
