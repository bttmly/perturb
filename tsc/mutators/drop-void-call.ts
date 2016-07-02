const { Syntax } = require("estraverse");
const R = require("ramda");
const voidNode = require("./_void-node");

import { MutatorPlugin } from "../types";

// drops a function call made for side effects
// (the return value isn't assigned to a variable)
// (will this cause lots of test timeouts due to uncalled callbacks?)
module.exports = <MutatorPlugin>{
  name: "dropVoidCall",
  nodeTypes: [Syntax.ExpressionStatement],
  filter: function (node) {
    if (R.path(["expression", "type"], node) !== Syntax.CallExpression) {
      return false;
    }

    // skip method calls of objects since often called for side effects on `this`
    if (R.path(["callee", "type"], node) !== Syntax.Identifier) {
      return false;
    }
  },
  mutator: function () { return voidNode },
};
