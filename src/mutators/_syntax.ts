const S = require("estraverse").Syntax;

S.LOOP_NODES = [S.WhileStatement, S.DoWhileStatement, S.ForStatement];

S.TEST_NODES = [S.IfStatement, S.ConditionalExpression, S.SwitchCase];

S.FUNC_NODES = [
  S.FunctionDeclaration,
  S.FunctionExpression,
  S.ArrowFunctionExpression,
];

export default S;
