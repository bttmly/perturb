import R = require("ramda");
import S = require("./_syntax");
import { MutatorPlugin } from "../types";

const prop = R.curry((prop: string, obj: any) => {
  if (obj.hasOwnProperty(prop)) {
    return obj[prop];
  }
  return null;
});

const plugin: MutatorPlugin = {
  // adds 1 to any number literal OR replaces 1 with 0
  // `var num = 735;` => `var num = 736;`
  // `var num = 1;` => `var num = 0;`
  name: "tweak-number-literal",
  nodeTypes: [S.Literal],
  filter: R.pipe(prop("value"), R.is(Number)),
  mutator(node) {
    const value: number = prop("value", node);

    if (value === 1) {
      return [R.assoc("value", 0, node), R.assoc("value", 2, node)];
    }

    return R.assoc("value", value + 1, node);
  },
};

export default plugin;
