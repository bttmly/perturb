import * as ESTree from "estree";
import S, { TEST_NODES } from "./_syntax";
import * as util from "./util";
import { hasProp } from "./_filters";
import createMutatorPlugin from "../make-mutator-plugin";

const BANG = "!";

// inverts a conditional test with a bang
// `if (isReady) {}` => `if (!(isReady)) {}`
// `while (arr.length) {} => `while(!(arr.length)) {}`
// `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
export default createMutatorPlugin({
  name: "conditional-test-invert",
  nodeTypes: TEST_NODES,
  filter: hasProp("test"),
  mutator: util.update("test", (test: ESTree.Node) => ({
    type: S.UnaryExpression,
    operator: BANG,
    argument: test,
  })),
});
