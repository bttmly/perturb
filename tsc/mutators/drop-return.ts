"use strict";

import NODE_TYPES from "../constants/node-types";
import NODE_ATTRS from "../constants/node-attrs";
import voidNode from "./_void-node";
import { MutatorPlugin } from "../types";
import * as R from "ramda";

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

