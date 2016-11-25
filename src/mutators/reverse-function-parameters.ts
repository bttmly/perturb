import R = require("ramda");
import S = require("./_syntax");
import voidNode = require("./_void-node");
import util = require("./util");

const FUNC_NODES = [
  S.FunctionDeclaration,
  S.FunctionExpression,
  S.ArrowFunctionExpression,
];

// reverse the perameter order for a function expression or declaration
// `function fn (a, b) {}` => `function fn (b, a) {}`
export = <MutatorPlugin>{
  name: "reverse-function-parameters",
  nodeTypes: FUNC_NODES,
  filter: util.lengthAtPropGreaterThan("params", 1),
  mutator: util.update("params", ps => ps.slice().reverse()),
};
