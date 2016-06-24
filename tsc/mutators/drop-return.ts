const NODE_TYPES = require("../constants/node-types");
const NODE_ATTRS = require("../constants/node-attrs");
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

export default <MutatorPlugin>{
  name: "dropReturn",
  nodeTypes: [NODE_TYPES.ReturnStatement],
  mutator: function (node: MaybeArgumentedNode) {
    if (node.argument == null) return voidNode;
    return <ESTree.ExpressionStatement>{
      type: NODE_TYPES.ExpressionStatement,
      expression: node.argument,
    }
  },
};

