import * as R from "ramda";
import { TEST_NODES } from "./_syntax";
import { TRUE_NODE } from "./_constant-nodes";
import * as util from "./util";
import { hasProp } from "./_filters";
import createMutatorPlugin from "../make-mutator-plugin";

export default createMutatorPlugin({
  name: "conditional-test-always",
  nodeTypes: TEST_NODES,
  filter: hasProp("test"),
  mutator: util.update("test", R.always(TRUE_NODE)),
});

