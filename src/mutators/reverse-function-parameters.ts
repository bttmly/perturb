///<reference path="../perturb.d.ts" />

import R = require("ramda");
import S = require("./_syntax");
import voidNode = require("./_void-node");

interface FunctionNode extends ESTree.Node {
  params: ESTree.Identifier[];
}

const FUNC_NODES = [
  S.FunctionDeclaration,
  S.FunctionExpression,
  S.ArrowFunctionExpression,
];

// reverse the perameter order for a function expression or declaration
// `function fn (a, b) {}` => `function fn (b, a) {}`
export = <MutatorPlugin>{
  name: "reverse-function-parameters",
  nodeTypes: FUNC_NODES,
  filter: function (node) {
    return R.path(["params", "length"], node) > 1;
  },
  mutator: function (node) {
    const params = (<FunctionNode>node).params.slice().reverse();
    return R.assoc("params", params, node);
  },
};
