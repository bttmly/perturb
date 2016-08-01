import R = require("ramda");
import S = require("./_syntax");

interface StringLiteral extends ESTree.Node {
  value: string;
}

const EMPTY_REPLACEMENT = "a";

export = <MutatorPlugin>{
  // drops first character of non-empty string; changes
  // empty strings to "a"
  // var s = ""; => var s = "a";
  // var name = "nick"; => var name = "ick";
  name: "tweak-string-literal",
  nodeTypes: [S.Literal],
  filter: function (node) {
    return typeof (<ESTree.Literal>node).value === "string";
  },
  mutator: function (node) {
    const {value} = <StringLiteral>node;
    const replacement = value.length ? value.slice(1) : EMPTY_REPLACEMENT;
    return R.assoc("value", replacement, node);
  },
};
