import BINARY_OPERATOR_SWAPS from "../constants/binary-operator-swaps";
import NODE_TYPES from "../constants/node-types";
import NODE_ATTRS from "../constants/node-attrs";
import * as R from "ramda";
import { MutatorPlugin } from "../types";

const NO_SWAP = {
  instanceof: "instanceof",
  in: "in",
}

// swaps [+, -] and [*, /]
// `age = age + 1;` => `age = age - 1;`
// `var since = new Date() - start;` => `var since = new Date() + start;`
// `var dy = rise / run;` => `var dy = rise * run;`
// `var area = w * h;` => `var area = w / h;`
export default <MutatorPlugin>{
  name: "swapBinaryOperators",
  nodeTypes: [NODE_TYPES.BinaryExpression],
  filter: function (node) {
    const op = <string>R.prop(NODE_ATTRS.operator, node);
    return !R.has(op, NO_SWAP);
  },
  mutator: function (node) {
    var prevOp = node[NODE_ATTRS.operator];
    var newOp = BINARY_OPERATOR_SWAPS[prevOp];
    return R.assoc(NODE_ATTRS.operator, newOp, node);
  },
};
