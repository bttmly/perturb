import NODE_ATTRS from "../constants/node-attrs";
import FUNC_NODES from "../constants/func-nodes";
import * as R from "ramda";
import { MutatorPlugin } from "../types";

interface FunctionNode extends ESTree.Node {
  params: Array<ESTree.Identifier>
}

// reverse the perameter order for a function expression or declaration
// `function fn (a, b) {}` => `function fn (b, a) {}`
export default <MutatorPlugin>{
  name: "reverseFunctionParameters",
  nodeTypes: Object.keys(FUNC_NODES),
  filter: function (node) {
    return R.path([NODE_ATTRS.params, "length"], node) > 1;
  },
  mutator: function (node) {
    const params = (<FunctionNode>node).params.slice().reverse();
    return R.assoc(NODE_ATTRS.params, params, node);
  },
};
