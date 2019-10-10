import { FUNC_NODES } from "./_syntax";
import * as util from "./util";
import { MutatorPlugin } from "../types";

// reverse the perameter order for a function expression or declaration
// `function fn (a, b) {}` => `function fn (b, a) {}`
const plugin: MutatorPlugin = {
  type: "mutator",
  name: "reverse-function-parameters",
  nodeTypes: FUNC_NODES,
  filter: util.lengthAtPropGreaterThan("params", 1),
  mutator: util.update("params", (ps: any[]) => ps.slice().reverse()),
};

export default plugin;
