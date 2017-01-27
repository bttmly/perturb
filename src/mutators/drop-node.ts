import R = require("ramda");
import S = require("./_syntax");
import {VOID_NODE} from "./_constant-nodes";

export = <MutatorPlugin>{
  name: "drop-node",
  nodeTypes: [
    S.ContinueStatement,
    S.BreakStatement,
  ],
  mutator: R.always(VOID_NODE),
};
