const R = require("ramda");
const { Syntax } = require("estraverse");

const dropItem = require("../util/drop-item");

import { MutatorPlugin } from "../types";

module.exports = <MutatorPlugin>{
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweak-arguments",
  nodeTypes: [Syntax.CallExpression],
  filter: function (node) {
    return R.path(["arguments", "length"], node) !== 0;
  },
  mutator: function (node) {
    return dropItem(node, "arguments", "first");
  },
};
