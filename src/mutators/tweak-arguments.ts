import R = require("ramda");
import S = require("./_syntax");
import dropItem = require("../util/drop-item");

export = <MutatorPlugin>{
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweak-arguments",
  nodeTypes: [S.CallExpression],
  filter: function (node) {
    return R.path(["arguments", "length"], node) !== 0;
  },
  mutator: function (node) {
    return dropItem(node, "arguments", "first");
  },
};
