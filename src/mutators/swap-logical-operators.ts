import R = require("ramda");
import S = require("./_syntax");

const AND = "&&";
const OR = "||";

// swaps && for || and vice versa
// `if (x && y)` => `if (x || y)`
// `while (f() || g())` => `while(f() && g())`
export = <MutatorPlugin>{
  name: "swap-logical-operators",
  nodeTypes: [S.LogicalExpression],
  mutator: function (node) {
    const prevOp = <string>R.prop("operator", node);
    const newOp = (prevOp === AND ? OR : AND);
    return R.assoc("operator", newOp, node);
  },
};
