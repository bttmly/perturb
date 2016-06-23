"use strict";

import NODE_TYPES from "../constants/node-types";
import NODE_ATTRS from "../constants/node-attrs";
import { MutatorPlugin } from "../types";
// throw new Error(); => new Error();
// delete obj.x; => obj.x;
// typeof obj; => obj;
// +new Date(); => new Date();

interface ArgumentedNode extends ESTree.Node {
  argument: any
}

export default <MutatorPlugin>{
  name: "dropOperator",
  nodeTypes: [
    NODE_TYPES.ThrowStatement,
    NODE_TYPES.UnaryExpression,
  ],
  mutator: function (node) {
    return (<ArgumentedNode>node).argument;
  },
};
