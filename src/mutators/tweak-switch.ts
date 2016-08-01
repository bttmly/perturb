import R = require("ramda");
import S = require("./_syntax");
import dropItem = require("../util/drop-item");

export = <MutatorPlugin>{
  name: "tweak-switch",
  nodeTypes: [S.SwitchStatement],
  filter: function (node) {
    return R.path(["cases", "length"], node) !== 0;
  },
  mutator: function (node) {
    return dropItem(node, "cases", "first");
  },
};
