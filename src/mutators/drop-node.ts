import R = require("ramda");
import S = require("./_syntax");
import voidNode = require("./_void-node");

export = <MutatorPlugin>{
  name: "drop-node",
  nodeTypes: [
    S.ContinueStatement,
    S.BreakStatement,
  ],
  mutator: () => voidNode,
};
