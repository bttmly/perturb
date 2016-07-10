const { Syntax } = require("estraverse");
const R = require("ramda");

import { MutatorPlugin } from "../types";

interface NumberLiteral extends ESTree.Literal {
  value: number;
}

module.exports = {
  // adds 1 to any number literal OR replaces 1 with 0
  // var num = 0; => var num = 1;
  // var x = 735; => var x = 736;
  name: "tweak-number-literal",
  nodeTypes: [Syntax.Literal],
  filter: function (node) {
    return typeof node.value === "number";
  },
  mutator: function (node) {
    const {value} = <NumberLiteral>node;
    return R.assoc("value", (value === 1 ? 0 : value + 1), node);
  },
};

