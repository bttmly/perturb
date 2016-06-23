"use strict";

import NODE_TYPES from "../constants/node-types";
import voidNode from "../util/void-node";
import { MutatorPlugin } from "../types";
import * as R from "ramda";

// drops a function call made for side effects
// (the return value isn't assigned to a variable)
// (will this cause lots of test timeouts due to uncalled callbacks?)
export default <MutatorPlugin>{
  name: "dropVoidCall",
  nodeTypes: [NODE_TYPES.ExpressionStatement],
  filter: function (node) {
    if (R.path(["expression", "type"], node) !== NODE_TYPES.CallExpression) {
      return false;
    }

    // skip method calls of objects since often called for side effects on `this`
    if (R.path(["callee", "type"], node) !== NODE_TYPES.Identifier) {
      return false;
    }
  },
  mutator: function { return voidNode },
};
