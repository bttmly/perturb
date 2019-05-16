import * as R from "ramda";
import S from "./_syntax";
import { MutatorPlugin } from "../types";
import * as ESTree from "estree";

const prop = (prop: string, obj: any) => {
  if (obj.hasOwnProperty(prop)) {
    return obj[prop];
  }
  return null;
};

// adds 1 to any number literal OR replaces 1 with 0
// `var num = 735;` => `var num = 736;`
// `var num = 1;` => `var num = 0;`

function negativeNumberNode(n: number): ESTree.Node {
  if (n >= 0) throw new Error("pass a positive number");
  n = n * -1;
  return {
    type: "UnaryExpression",
    operator: "-",
    argument: {
      type: "Literal",
      value: n,
      raw: String(n),
    },
    prefix: true,
  };
}

function nonNegativeNumberNode(n: number): ESTree.Node {
  return {
    type: "Literal",
    value: n,
    raw: String(n),
  };
}

const plugin: MutatorPlugin = {
  type: "mutator",
  name: "tweak-number-literal",
  nodeTypes: [S.Literal],
  filter: node => R.is(Number, prop("value", node)),
  mutator(node) {
    const value: number = prop("value", node);
    return R.uniq([value + 1, value - 1, -1, 0, 1])
      .filter(v => v !== value)
      .map(v => (v > -1 ? nonNegativeNumberNode(v) : negativeNumberNode(v)));
  },
};

export default plugin;
