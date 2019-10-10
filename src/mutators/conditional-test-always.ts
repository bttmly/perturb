import * as R from "ramda";
import { TEST_NODES } from "./_syntax";
import { TRUE_NODE } from "./_constant-nodes";
import * as util from "./util";
import { MutatorPlugin } from "../types";
import { hasProp } from "./_filters";

const plugin: MutatorPlugin = {
  type: "mutator",
  name: "conditional-test-always",
  nodeTypes: TEST_NODES,
  filter: hasProp("test"),
  mutator: util.update("test", R.always(TRUE_NODE)),
};

export default plugin;
