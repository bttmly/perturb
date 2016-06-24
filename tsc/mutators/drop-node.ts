"use strict";

import NODE_TYPES from "../constants/node-types";
import voidNode from "./_void-node";
import { MutatorPlugin } from "../types";

export default <MutatorPlugin>{
  name: "dropNode",
  nodeTypes: [
    NODE_TYPES.ContinueStatement,
    NODE_TYPES.BreakStatement,
  ],
  mutator: function () { return voidNode },
};
