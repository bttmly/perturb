import R = require("ramda");
import S = require("./_syntax");
import voidNode = require("./_void-node");

// drops a function call made for side effects
// (the return value isn't assigned to a variable)
// (will this cause lots of test timeouts due to uncalled callbacks?)
export = <MutatorPlugin>{
  name: "drop-void-call",
  nodeTypes: [S.ExpressionStatement],
  filter: R.both(
    R.pathEq(["expression", "type"], S.CallExpression),
    R.pathEq(["expression", "callee", "type"], S.Identifier)
  ),
  mutator: R.always(voidNode),
};


