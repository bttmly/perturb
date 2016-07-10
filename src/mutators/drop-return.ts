const { Syntax } = require("estraverse")
const voidNode = require("./_void-node");
const R = require("ramda");

import { MutatorPlugin } from "../types";

// drop return w/o affecting the rest of the expression/statement
// if return statement has no argument, instead transform it into `void 0;`
// `return something;` => `something;`
// `return;` => `void 0;`

interface MaybeArgumentedNode extends ESTree.Node {
  argument?: any
}

module.exports = <MutatorPlugin>{
  name: "drop-return",
  nodeTypes: [Syntax.ReturnStatement],
  mutator: function (node: MaybeArgumentedNode) {
    if (node.argument == null) return voidNode;
    return <ESTree.ExpressionStatement>{
      type: Syntax.ExpressionStatement,
      expression: node.argument,
    }
  },
};

