import S = require("./_syntax");
import util = require("./util");
import { MutatorPlugin } from "../types";

const BINARY_OPERATOR_SWAPS = require("../constants/binary-operator-swaps");

// swaps [+, -] and [*, /]
// `age = age + 1;` => `age = age - 1;`
// `var since = new Date() - start;` => `var since = new Date() + start;`
// `var dy = rise / run;` => `var dy = rise * run;`
// `var area = w * h;` => `var area = w / h;`
const plugin: MutatorPlugin = {
  name: "swap-binary-operators",
  nodeTypes: [S.BinaryExpression],
  // TODO: ts-any
  filter(node: any) {
    const op = node.operator;
    if (op == null) return false;
    return BINARY_OPERATOR_SWAPS.hasOwnProperty(op);
  },
  mutator: util.update("operator", (op: string) => BINARY_OPERATOR_SWAPS[op]),
};

export default plugin;
