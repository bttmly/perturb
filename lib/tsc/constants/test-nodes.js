const NODE_TYPES = require("./node-types");
module.exports = {
    [NODE_TYPES.IfStatement]: NODE_TYPES.IfStatement,
    [NODE_TYPES.WhileStatement]: NODE_TYPES.WhileStatement,
    [NODE_TYPES.DoWhileStatement]: NODE_TYPES.DoWhileStatement,
    [NODE_TYPES.ForStatement]: NODE_TYPES.ForStatement,
    [NODE_TYPES.ConditionalExpression]: NODE_TYPES.ConditionalExpression,
    [NODE_TYPES.SwitchCase]: NODE_TYPES.SwitchCase,
};
