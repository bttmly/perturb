import R = require("ramda");
import S = require("./_syntax");
import dropItem = require("../util/drop-item");

export = <MutatorPlugin>{
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweak-array-literal",
  nodeTypes: [S.ArrayExpression],
  filter: function (node) {
    return R.path(["elements", "length"], node) !== 0;
  },
  mutator: function (node) {
    return dropItem(<ESTree.ArrayExpression>node, "elements", "first");
  },
};
