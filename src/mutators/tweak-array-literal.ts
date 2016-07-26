const R = require("ramda");
const { Syntax } = require("estraverse");

const dropItem = require("../util/drop-item");

import { MutatorPlugin } from "../types";

export = <MutatorPlugin>{
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweak-array-literal",
  nodeTypes: [Syntax.ArrayExpression],
  filter: function (node) {
    return R.path(["elements", "length"], node) !== 0;
  },
  mutator: function (node) {
    return dropItem(<ESTree.ArrayExpression>node, "elements", "first");
  },
};
