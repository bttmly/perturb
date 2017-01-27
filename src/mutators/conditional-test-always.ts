import R = require("ramda");
import S = require("./_syntax");
import {TRUE_NODE} from "./_constant-nodes";
import util = require("./util");

export = <MutatorPlugin>{
  name: "invert-conditional-test",
  nodeTypes: S.TEST_NODES,
  filter: R.prop("test"),
  mutator: util.update("test", R.always(TRUE_NODE)),
};
