import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");

const AND = "&&";
const OR = "||";

// swaps && for || and vice versa
// `if (x && y)` => `if (x || y)`
// `while (f() || g())` => `while(f() && g())`
export = <MutatorPlugin>{
  name: "swap-logical-operators",
  nodeTypes: [S.LogicalExpression],
  mutator: util.update("operator", op => op === AND ? OR : AND)
};
