import R = require("ramda");
import S = require("./_syntax");
import {TRUE_NODE} from "./_constant-nodes";
import util = require("./util");
import { MutatorPlugin } from "../types"
import { hasProp } from "./_filters"

const plugin: MutatorPlugin = {
  name: "invert-conditional-test",
  nodeTypes: S.TEST_NODES,
  filter: hasProp("test"),
  mutator: util.update("test", R.always(TRUE_NODE)),
}

export default plugin