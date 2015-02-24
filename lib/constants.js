"use strict";

var util = require("./util");

var ISSUES_URL = "https://github.com/nickb1080/perturb/issues";

var JS_TYPES = util.constObj({
  func: "function",
  bool: "boolean",
  str: "string",
  num: "number",
  obj: "object",
});

var BINARY_OPERATOR_SWAPS = util.constObj({
  "+": "-",
  "-": "+",
  "*": "/",
  "/": "*",
  ">": "<=",
  "<=": ">",
  "<": ">=",
  ">=": "<",
  "==": "!=",
  "!=": "==",
  "===": "!==",
  "!==": "===",
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
  "WithStatement",
]);

var FUNC_NODES = util.mapMirror([
  NODE_TYPES.FunctionDeclaration,
  NODE_TYPES.FunctionExpression,
]);

var NODES_WITH_TEST = util.mapMirror([
  NODE_TYPES.IfStatement,
  NODE_TYPES.WhileStatement,
  NODE_TYPES.DoWhileStatement,
  NODE_TYPES.ForStatement,
  NODE_TYPES.ConditionalExpression,
  NODE_TYPES.SwitchCase,
]);

var ERRORS = util.constObj({
  NotKeyedIterable: "Node must be an Immutable.js keyed iterable",
  WrongNodeType: "Node is of wrong type. Actual: %s; Expected: %s",
  TestsFailed: "Test command failed. Tests must be passing for perturb to work properly.",
});

var MESSAGES = util.constObj({
  TestsPassed: "Test command exited with `0`. Continuing...",
  ExecutingTests: "executing `%s` ...",
  DefaultTest: "npm test",
});

module.exports = {
  BINARY_OPERATOR_SWAPS: BINARY_OPERATOR_SWAPS,
  NODES_WITH_TEST: NODES_WITH_TEST,
  NODE_TYPES: NODE_TYPES,
  FUNC_NODES: FUNC_NODES,
  ISSUES_URL: ISSUES_URL,
  JS_TYPES: JS_TYPES,
  ERRORS: ERRORS,
  MESSAGES: MESSAGES,
};
