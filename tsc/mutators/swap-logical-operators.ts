"use strict";

import NODE_TYPES from "../constants/node-types";
import NODE_ATTRS from "../constants/node-attrs";
import * as R from "ramda";
import { MutatorPlugin } from "../types";

const AND = "&&";
const OR = "||";

// swaps && for || and vice versa
// `if (x && y)` => `if (x || y)`
// `while (f() || g())` => `while(f() && g())`
export default <MutatorPlugin>{
  name: "swapLogicalOperators",
  nodeTypes: [NODE_TYPES.LogicalExpression],
  mutator: function (node) {
    const prevOp = <string>node[NODE_ATTRS.operator]
    const newOp = (prevOp === AND ? OR : AND);
    return R.assoc(NODE_ATTRS.operator, newOp, node);
  },
};
