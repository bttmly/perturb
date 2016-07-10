const { Syntax } = require("estraverse");
const R = require("ramda");

import { MutatorPlugin } from "../types";

// `var isOk = true` => `var isOk = false`
module.exports = <MutatorPlugin>{
  name: "tweak-boolean-literal",
  nodeTypes: [Syntax.Literal],
  filter: function (node) {
    const {value} = (<ESTree.Literal>node);
    return value === true || value === false;
  },
  mutator: function (node) {
    const {value} = (<ESTree.Literal>node);
    return R.assoc("value", !value, node);
  },
};
