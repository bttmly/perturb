var NODE_TYPES = require("./node-types");
var mapMirror = require("../util/map-mirror");

module.exports = mapMirror([
  NODE_TYPES.IfStatement,
  NODE_TYPES.WhileStatement,
  NODE_TYPES.DoWhileStatement,
  NODE_TYPES.ForStatement,
  NODE_TYPES.ConditionalExpression,
  NODE_TYPES.SwitchCase,
]);
