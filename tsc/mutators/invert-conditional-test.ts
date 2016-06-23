import * as R from "ramda";
import NODE_TYPES from "../constants/node-types";
import NODE_ATTRS from "../constants/node-attrs";
import TEST_NODES from "../constants/test-nodes";
import { MutatorPlugin } from "../types";

const BANG = "!";

// inverts a conditional test with a bang
// `if (isReady) {}` => `if (!(isReady)) {}`
// `while (arr.length) {} => `while(!(arr.length)) {}`
// `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
export default <MutatorPlugin>{
  name: "invertConditionalTest",
  nodeTypes: Object.keys(TEST_NODES),
  filter: function (node) {
    // using get() over has() ensures it isn't null (switch case `default`!)
    return Boolean(R.prop(NODE_ATTRS.test, node));
  },
  mutator: function (node) {
    return R.assoc(NODE_ATTRS.test, <ESTree.UnaryExpression>{
      type: NODE_TYPES.UnaryExpression,
      operator: BANG,
      argument: node[NODE_ATTRS.test],
    }, node);
  },
};
