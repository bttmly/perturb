import * as R from "ramda";
import S from "./_syntax";
import { VOID_NODE } from "./_constant-nodes";
import createMutatorPlugin from "../make-mutator-plugin";

export default createMutatorPlugin({
  name: "drop-node",
  nodeTypes: [S.ContinueStatement, S.BreakStatement],
  mutator: R.always(VOID_NODE),
});
