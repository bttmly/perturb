import R = require("ramda");
import S = require("./_syntax");
import voidNode = require("./_void-node");

interface TestNode extends ESTree.Node {
  test: ESTree.Node
}

const BANG = "!";

// leaving out while, do-while, and for because inverting them usually(?) 
// makes an infinite loop
const TEST_NODES = [
  S.IfStatement,
  // S.WhileStatement,
  // S.DoWhileStatement,
  // S.ForStatement,
  S.ConditionalExpression,
  S.SwitchCase,
];

// inverts a conditional test with a bang
// `if (isReady) {}` => `if (!(isReady)) {}`
// `while (arr.length) {} => `while(!(arr.length)) {}`
// `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
export = <MutatorPlugin>{
  name: "invert-conditional-test",
  nodeTypes: TEST_NODES,
  filter: function (node) {
    // using prop() over has() ensures it isn't null (switch case `default`!)
    return Boolean(R.prop("test", node));
  },
  mutator: function (node) {
    const testNode = <TestNode>node;
    return R.assoc("test", <ESTree.UnaryExpression>{
      type: S.UnaryExpression,
      operator: BANG,
      argument: testNode.test,
    }, testNode);
  },
};
