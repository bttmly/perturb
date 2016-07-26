const { Syntax } = require("estraverse");
const voidNode = require("./_void-node");

import { MutatorPlugin } from "../types";

export = <MutatorPlugin>{
  name: "drop-node",
  nodeTypes: [
    Syntax.ContinueStatement,
    Syntax.BreakStatement,
  ],
  mutator: function () { return voidNode },
};
