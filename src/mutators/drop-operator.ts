///<reference path="../perturb.d.ts" />

import S = require("./_syntax");

// throw new Error(); => new Error();
// delete obj.x; => obj.x;
// typeof obj; => obj;
// +new Date(); => new Date();

interface ArgumentedNode extends ESTree.Node {
  argument: any
}

export = <MutatorPlugin>{
  name: "drop-operator",
  nodeTypes: [
    S.ThrowStatement,
    S.UnaryExpression,
  ],
  mutator: function (node) {
    return (<ArgumentedNode>node).argument;
  },
};
