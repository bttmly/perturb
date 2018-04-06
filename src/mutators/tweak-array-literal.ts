import S = require("./_syntax");
import util = require("./util");
import { MutatorPlugin } from "../types";

const plugin: MutatorPlugin = {
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweak-array-literal",
  nodeTypes: [S.ArrayExpression],
  mutator: util.dropEachOfProp("elements"),
};

export default plugin;
