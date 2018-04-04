import * as ESTree from "estree";

import S = require("./_syntax");
import util = require("./util");
import { hasProp } from "./_filters"
import { MutatorPlugin } from "../types"

const BANG = "!";

// inverts a conditional test with a bang
// `if (isReady) {}` => `if (!(isReady)) {}`
// `while (arr.length) {} => `while(!(arr.length)) {}`
// `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
const mutator: MutatorPlugin = {
  name: "invert-conditional-test",
  nodeTypes: S.TEST_NODES,
  filter: hasProp("test"),
  mutator: util.update(
    "test", (test: ESTree.Node) => ({
      type: S.UnaryExpression,
      operator: BANG,
      argument: test
    })
  ),
}

export default mutator;
