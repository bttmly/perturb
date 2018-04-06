import R = require("ramda");
import S = require("./_syntax");
import { VOID_NODE } from "./_constant-nodes";
import { MutatorPlugin } from "../types";

const plugin: MutatorPlugin = {
  name: "drop-node",
  nodeTypes: [S.ContinueStatement, S.BreakStatement],
  mutator: R.always(VOID_NODE),
};

export default plugin;
