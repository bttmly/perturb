const R = require("ramda");
const FUNC_NODES = require("../constants/func-nodes");

import { MutatorPlugin } from "../types";

interface FunctionNode extends ESTree.Node {
  params: Array<ESTree.Identifier>
}

// reverse the perameter order for a function expression or declaration
// `function fn (a, b) {}` => `function fn (b, a) {}`
module.exports = <MutatorPlugin>{
  name: "reverse-function-parameters",
  nodeTypes: Object.keys(FUNC_NODES),
  filter: function (node) {
    return R.path(["params", "length"], node) > 1;
  },
  mutator: function (node) {
    const params = (<FunctionNode>node).params.slice().reverse();
    return R.assoc("params", params, node);
  },
};
