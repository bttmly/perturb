import R = require("ramda");
import S = require("./_syntax");
import voidNode = require("./_void-node");

const BINARY_OPERATOR_SWAPS = require("../constants/binary-operator-swaps");

const NO_SWAP = {
  instanceof: "instanceof",
  in: "in",
}

// swaps [+, -] and [*, /]
// `age = age + 1;` => `age = age - 1;`
// `var since = new Date() - start;` => `var since = new Date() + start;`
// `var dy = rise / run;` => `var dy = rise * run;`
// `var area = w * h;` => `var area = w / h;`
export = <MutatorPlugin>{
  name: "swap-binary-operators",
  nodeTypes: [S.BinaryExpression],
  filter: function (node) {
    const op = <string>R.prop("operator", node);
    return !R.has(op, NO_SWAP);
  },
  mutator: function (node) {
    const prevOp = R.prop("operator", node);
    const newOp = BINARY_OPERATOR_SWAPS[<string>prevOp];
    return R.assoc("operator", newOp, node);
  },
};
