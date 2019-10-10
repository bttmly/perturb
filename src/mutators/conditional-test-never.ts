import * as R from "ramda";
import { LOOP_NODES, TEST_NODES } from "./_syntax";
import * as util from "./util";
import { FALSE_NODE } from "./_constant-nodes";
import { hasProp } from "./_filters";
import { MutatorPlugin } from "../types";

const plugin: MutatorPlugin = {
  type: "mutator",
  name: "conditional-test-never",
  nodeTypes: LOOP_NODES.concat(TEST_NODES),
  filter: hasProp("test"),
  mutator: util.update("test", R.always(FALSE_NODE)),
};

export default plugin;
