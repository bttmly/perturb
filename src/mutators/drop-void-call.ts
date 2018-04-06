import R = require("ramda");
import S = require("./_syntax");
import { VOID_NODE } from "./_constant-nodes";
import { MutatorPlugin } from "../types";

// drops a function call made for side effects
// (the return value isn't assigned to a variable)
// (will this cause lots of test timeouts due to uncalled callbacks?)

const plugin: MutatorPlugin = {
  name: "drop-void-call",
  nodeTypes: [S.ExpressionStatement],
  filter: R.both(
    R.pathEq(["expression", "type"], S.CallExpression),
    R.pathEq(["expression", "callee", "type"], S.Identifier),
  ),
  mutator: R.always(VOID_NODE),
};

export default plugin;
