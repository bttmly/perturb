var S = require("estraverse").Syntax;

export = {
  [S.FunctionDeclaration]: S.FunctionDeclaration,
  [S.FunctionExpression]: S.FunctionExpression,
  [S.ArrowFunctionExpression]: S.ArrowFunctionExpression,
}