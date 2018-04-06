const S = require("estraverse").Syntax;

S.LOOP_NODES = [S.WhileStatement, S.DoWhileStatement, S.ForStatement];

S.TEST_NODES = [S.IfStatement, S.ConditionalExpression, S.SwitchCase];

export default S;
