import R = require("ramda");
import S = require("./_syntax");
import voidNode = require("./_void-node");

// drops a function call made for side effects
// (the return value isn't assigned to a variable)
// (will this cause lots of test timeouts due to uncalled callbacks?)
export = <MutatorPlugin>{
  name: "drop-void-call",
  nodeTypes: [S.ExpressionStatement],
  filter (node) {
    if (R.path(["expression", "type"], node) !== S.CallExpression) {
      return false;
    }

    // skip method calls of objects since often called for side effects on `this`
    if (R.path(["expression", "callee", "type"], node) !== S.Identifier) {
      return false;
    }

    return true;
  },
  mutator: function () { return voidNode },
};
