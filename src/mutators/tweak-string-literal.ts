const { Syntax } = require("estraverse");
const R = require("ramda");

import { MutatorPlugin } from "../types";

interface StringLiteral extends ESTree.Node {
  value: string;
}

const EMPTY_REPLACEMENT = "a";

module.exports = <MutatorPlugin>{
  // drops first character of non-empty string; changes
  // empty strings to "a"
  // var s = ""; => var s = "a";
  // var name = "nick"; => var name = "ick";
  name: "tweak-string-literal",
  nodeTypes: [Syntax.Literal],
  filter: function (node) {
    return typeof (<ESTree.Literal>node).value === "string";
  },
  mutator: function (node) {
    const {value} = <StringLiteral>node;
    const replacement = value.length ? value.slice(1) : EMPTY_REPLACEMENT;
    return R.assoc("value", replacement, node);
  },
};
