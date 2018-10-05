import S from "./_syntax";
import * as util from "./util";
import { MutatorPlugin } from "../types";

// drops the first declared element in an array literal
// `['a', 'b']` => `['a']`

const plugin: MutatorPlugin = {
  type: "mutator",
  name: "tweak-array-literal",
  nodeTypes: [S.ArrayExpression],
  mutator: util.dropEachOfProp("elements"),
};

export default plugin;
