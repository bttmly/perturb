var NODE_TYPES = require("./node-types");
var mapMirror = require("../util/map-mirror");

module.exports = mapMirror([
  NODE_TYPES.FunctionDeclaration,
  NODE_TYPES.FunctionExpression,
  NODE_TYPES.ArrowFunctionExpression
]);