import S from "./_syntax";
import * as util from "./util";
import { MutatorPlugin } from "../types";

const AND = "&&";
const OR = "||";

type LogicalOperator = "&&" | "||";

// swaps && for || and vice versa
// `if (x && y)` => `if (x || y)`
// `while (f() || g())` => `while(f() && g())`
const plugin: MutatorPlugin = {
  name: "swap-logical-operators",
  nodeTypes: [S.LogicalExpression],
  mutator: util.update(
    "operator",
    (op: LogicalOperator) => (op === AND ? OR : AND),
  ),
};

export default plugin;
