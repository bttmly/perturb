import * as R from "ramda";
import S from "./_syntax";
import { VOID_NODE } from "./_constant-nodes";
import { MutatorPlugin } from "../types";

const plugin: MutatorPlugin = {
  type: "mutator",
  name: "drop-node",
  nodeTypes: [S.ContinueStatement, S.BreakStatement],
  mutator: R.always(VOID_NODE),
};

export default plugin;
