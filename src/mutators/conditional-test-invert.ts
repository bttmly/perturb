import * as ESTree from "estree";

import S from "./_syntax";
import * as util from "./util";
import { hasProp } from "./_filters";
import { MutatorPlugin } from "../types";

const BANG = "!";

// inverts a conditional test with a bang
// `if (isReady) {}` => `if (!(isReady)) {}`
// `while (arr.length) {} => `while(!(arr.length)) {}`
// `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
const mutator: MutatorPlugin = {
  type: "mutator",
  name: "conditional-test-invert",
  nodeTypes: S.TEST_NODES,
  filter: hasProp("test"),
  mutator: util.update("test", (test: ESTree.Node) => ({
    type: S.UnaryExpression,
    operator: BANG,
    argument: test,
  })),
};

export default mutator;
