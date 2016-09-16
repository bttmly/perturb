import R = require("ramda");
import S = require("./_syntax");

interface NumberLiteral extends ESTree.Literal {
  value: number;
}

export = <MutatorPlugin>{
  // adds 1 to any number literal OR replaces 1 with 0
  // `var num = 735;` => `var num = 736;`
  // `var num = 1;` => `var num = 0;`
  name: "tweak-number-literal",
  nodeTypes: [S.Literal],
  filter: function (node) {
    const {value} = (<ESTree.Literal>node);
    return typeof value === "number";
  },
  mutator: function (node) {
    const {value} = <NumberLiteral>node;
    const newVal = value === 1 ? 0 : value + 1;
    return R.merge(node, { value: newVal, raw: String(newVal) });
  },
};

