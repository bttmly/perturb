const { Syntax } = require("estraverse");

import { MutatorPlugin } from "../types";

// throw new Error(); => new Error();
// delete obj.x; => obj.x;
// typeof obj; => obj;
// +new Date(); => new Date();

interface ArgumentedNode extends ESTree.Node {
  argument: any
}

module.exports = <MutatorPlugin>{
  name: "drop-operator",
  nodeTypes: [
    Syntax.ThrowStatement,
    Syntax.UnaryExpression,
  ],
  mutator: function (node) {
    return (<ArgumentedNode>node).argument;
  },
};
