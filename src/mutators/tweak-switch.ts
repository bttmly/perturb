const { Syntax } = require("estraverse");
const R = require("ramda");

const dropItem = require("../util/drop-item");

import { MutatorPlugin } from "../types";

export = <MutatorPlugin>{
  name: "tweak-switch",
  nodeTypes: [Syntax.SwitchStatement],
  filter: function (node) {
    return R.path(["cases", "length"], node) !== 0;
  },
  mutator: function (node) {
    return dropItem(node, "cases", "first");
  },
};
