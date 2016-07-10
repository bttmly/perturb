const R = require("ramda");
const { Syntax } = require("estraverse");
const TEST_NODES = require("../constants/test-nodes");

import { MutatorPlugin } from "../types";

const BANG = "!";

interface TestNode extends ESTree.Node {
  test: ESTree.Node
}

// inverts a conditional test with a bang
// `if (isReady) {}` => `if (!(isReady)) {}`
// `while (arr.length) {} => `while(!(arr.length)) {}`
// `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
module.exports = <MutatorPlugin>{
  name: "invert-conditional-test",
  nodeTypes: Object.keys(TEST_NODES),
  filter: function (node) {
    // using get() over has() ensures it isn't null (switch case `default`!)
    return Boolean(R.prop("test", node));
  },
  mutator: function (node) {
    const testNode = <TestNode>node;
    return R.assoc("test", <ESTree.UnaryExpression>{
      type: Syntax.UnaryExpression,
      operator: BANG,
      argument: testNode.test,
    }, testNode);
  },
};
