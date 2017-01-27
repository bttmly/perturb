import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");
import {FALSE_NODE} from "./_constant-nodes"

export = <MutatorPlugin>{
  name: "invert-conditional-test",
  nodeTypes: S.LOOP_NODES.concat(S.TEST_NODES),
  filter: R.prop("test"),
  mutator: util.update("test", R.always(FALSE_NODE)),
};
