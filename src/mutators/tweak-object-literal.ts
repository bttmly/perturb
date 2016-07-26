const { Syntax } = require("estraverse");
const R = require("ramda");

const dropItem = require("../util/drop-item");

import { MutatorPlugin } from "../types";

export = <MutatorPlugin>{
  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  name: "tweak-object-literal",
  nodeTypes: [Syntax.ObjectExpression],
  filter: function (node) {
    return R.path(["properties", "length"], node) !== 0;
  },
  mutator: function (node) {
    return dropItem(<ESTree.ArrayExpression>node, "properties", "first");
  },
};
