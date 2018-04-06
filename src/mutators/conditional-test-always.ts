import R = require("ramda");
import S = require("./_syntax");
import { TRUE_NODE } from "./_constant-nodes";
import * as util from "./util";
import { MutatorPlugin } from "../types";
import { hasProp } from "./_filters";

const plugin: MutatorPlugin = {
  name: "conditional-test-always",
  nodeTypes: S.TEST_NODES,
  filter: hasProp("test"),
  mutator: util.update("test", R.always(TRUE_NODE)),
};

export default plugin;
