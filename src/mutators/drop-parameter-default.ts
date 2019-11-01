import * as R from "ramda";
import S, { FUNC_NODES } from "./_syntax";
import { VOID_NODE } from "./_constant-nodes";
import createMutatorPlugin from "../make-mutator-plugin";

// a default parameter
// input: `function fn (x = 1) {}`
// output: `function fn (x) {}`

export default createMutatorPlugin({
  name: "drop-return",
  nodeTypes: FUNC_NODES,
  mutator: R.ifElse(
    node => node.argument == null,
    R.always(VOID_NODE),
    node => ({
      type: S.ExpressionStatement,
      expression: node.argument,
    }),
  ),
});
