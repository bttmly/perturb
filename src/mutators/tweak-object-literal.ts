import R = require("ramda");
import S = require("./_syntax");
import dropItem = require("../util/drop-item");

export = <MutatorPlugin>{
  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  name: "tweak-object-literal",
  nodeTypes: [S.ObjectExpression],
  filter: function (node) {
    return R.path(["properties", "length"], node) !== 0;
  },
  mutator: function (node) {
    return dropItem(<ESTree.ArrayExpression>node, "properties", "first");
  },
};
