const { Syntax } = require("estraverse");
const voidNode = require("./_void-node");

import { MutatorPlugin } from "../types";

module.exports = <MutatorPlugin>{
  name: "dropNode",
  nodeTypes: [
    Syntax.ContinueStatement,
    Syntax.BreakStatement,
  ],
  mutator: function () { return voidNode },
};
