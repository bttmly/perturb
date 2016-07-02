var S = require("estraverse").Syntax;

module.exports = {
  [S.FunctionDeclaration]: S.FunctionDeclaration,
  [S.FunctionExpression]: S.FunctionExpression,
  [S.ArrowFunctionExpression]: S.ArrowFunctionExpression,
}