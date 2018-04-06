import S from "./_syntax";
import * as util from "./util";
import { MutatorPlugin } from "../types";

const FUNC_NODES = [
  S.FunctionDeclaration,
  S.FunctionExpression,
  S.ArrowFunctionExpression,
];

// reverse the perameter order for a function expression or declaration
// `function fn (a, b) {}` => `function fn (b, a) {}`
const plugin: MutatorPlugin = {
  name: "reverse-function-parameters",
  nodeTypes: FUNC_NODES,
  filter: util.lengthAtPropGreaterThan("params", 1),
  mutator: util.update("params", (ps: any[]) => ps.slice().reverse()),
};

export default plugin;
