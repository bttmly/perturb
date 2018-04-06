import * as R from "ramda";
import S from "./_syntax";
import * as util from "./util";
import { FALSE_NODE } from "./_constant-nodes";
import { hasProp } from "./_filters";
import { MutatorPlugin } from "../types";

const plugin: MutatorPlugin = {
  name: "conditional-test-never",
  nodeTypes: S.LOOP_NODES.concat(S.TEST_NODES),
  filter: hasProp("test"),
  mutator: util.update("test", R.always(FALSE_NODE)),
};

export default plugin;
