"use strict";

var util = require("./util");

var JS_TYPES = util.constObj({
  func: "function",
  bool: "boolean",
  str: "string",
  num: "number",
  obj: "object"
});

var NODE_TYPES = util.mapMirror([
  "AssignmentExpression",
  "ArrayExpression",
  "ArrowFunctionExpression",
  "BlockStatement",
  "BinaryExpression",
  "BreakStatement",
  "CallExpression",
  "CatchClause",
  "ConditionalExpression",
  "ContinueStatement",
  "DoWhileStatement",
  "DebuggerStatement",
  "EmptyStatement",
  "ExpressionStatement",
  "ForStatement",
  "ForInStatement",
  "FunctionDeclaration",
  "FunctionExpression",
  "Identifier",
  "IfStatement",
  "Literal",
  "LabeledStatement",
  "LogicalExpression",
  "MemberExpression",
  "NewExpression",
  "ObjectExpression",
  "Program",
  "Property",
  "ReturnStatement",
  "SequenceExpression",
  "SwitchStatement",
  "SwitchCase",
  "ThisExpression",
  "ThrowStatement",
  "TryStatement",
  "UnaryExpression",
  "UpdateExpression",
  "VariableDeclaration",
  "VariableDeclarator",
  "WhileStatement",
  "WithStatement"
]);

var FUNC_NODES = util.mapMirror([
  NODE_TYPES.FunctionDeclaration,
  NODE_TYPES.FunctionExpression
]);

var NODES_WITH_TEST = util.mapMirror([
  NODE_TYPES.IfStatement,
  NODE_TYPES.WhileStatement,
  NODE_TYPES.DoWhileStatement,
  NODE_TYPES.ForStatement,
  NODE_TYPES.ConditionalExpression,
  NODE_TYPES.SwitchCase,
]);

module.exports = {
  NODES_WITH_TEST: NODES_WITH_TEST,
  NODE_TYPES: NODE_TYPES,
  FUNC_NODES: FUNC_NODES,
  JS_TYPES: JS_TYPES
};
