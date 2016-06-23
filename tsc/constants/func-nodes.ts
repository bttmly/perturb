import NODE_TYPES from "./node-types";

export default {
  [NODE_TYPES.FunctionDeclaration]: NODE_TYPES.FunctionDeclaration,
  [NODE_TYPES.FunctionExpression]: NODE_TYPES.FunctionExpression,
  [NODE_TYPES.ArrowFunctionExpression]: NODE_TYPES.ArrowFunctionExpression,
}