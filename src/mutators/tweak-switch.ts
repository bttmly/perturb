import R = require("ramda");
import S = require("./_syntax");
import dropEachOfProp = require("../util/drop-each-of-prop");

export = <MutatorPlugin>{
  name: "tweak-switch",
  nodeTypes: [S.SwitchStatement],
  filter: function (node) {
    return R.path(["cases", "length"], node) !== 0;
  },
  mutator: function (node):  ESTree.Node[] {
    return dropEachOfProp("cases", node);
  },
};
