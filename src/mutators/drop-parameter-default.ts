import * as R from "ramda";
import S from "./_syntax";
import { VOID_NODE } from "./_constant-nodes";
import { MutatorPlugin } from "../types";

// a default parameter
// input: `function fn (x = 1) {}`
// output: `function fn (x) {}`

const plugin: MutatorPlugin = {
  type: "mutator",
  name: "drop-return",
  nodeTypes: S.FUNC_NODES,
  mutator: R.ifElse(
    node => node.argument == null,
    R.always(VOID_NODE),
    node => ({
      type: S.ExpressionStatement,
      expression: node.argument,
    }),
  ),
};

export default plugin;
