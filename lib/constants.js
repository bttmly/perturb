"use strict";

var util = require("./util");

var NODE_TYPES = util.constObj({
  AssignmentExpression: "AssignmentExpression",
  ArrayExpression: "ArrayExpression",
  ArrowFunctionExpression: "ArrowFunctionExpression",
  BlockStatement: "BlockStatement",
  BinaryExpression: "BinaryExpression",
  BreakStatement: "BreakStatement",
  CallExpression: "CallExpression",
  CatchClause: "CatchClause",
  ConditionalExpression: "ConditionalExpression",
  ContinueStatement: "ContinueStatement",
  DoWhileStatement: "DoWhileStatement",
  DebuggerStatement: "DebuggerStatement",
  EmptyStatement: "EmptyStatement",
  ExpressionStatement: "ExpressionStatement",
  ForStatement: "ForStatement",
  ForInStatement: "ForInStatement",
  FunctionDeclaration: "FunctionDeclaration",
  FunctionExpression: "FunctionExpression",
  Identifier: "Identifier",
  IfStatement: "IfStatement",
  Literal: "Literal",
  LabeledStatement: "LabeledStatement",
  LogicalExpression: "LogicalExpression",
  MemberExpression: "MemberExpression",
  NewExpression: "NewExpression",
  ObjectExpression: "ObjectExpression",
  Program: "Program",
  Property: "Property",
  ReturnStatement: "ReturnStatement",
  SequenceExpression: "SequenceExpression",
  SwitchStatement: "SwitchStatement",
  SwitchCase: "SwitchCase",
  ThisExpression: "ThisExpression",
  ThrowStatement: "ThrowStatement",
  TryStatement: "TryStatement",
  UnaryExpression: "UnaryExpression",
  UpdateExpression: "UpdateExpression",
  VariableDeclaration: "VariableDeclaration",
  VariableDeclarator: "VariableDeclarator",
  WhileStatement: "WhileStatement",
  WithStatement: "WithStatement"
});

var JS_TYPES = util.constObj({
  func: "function",
  bool: "boolean",
  str: "string",
  num: "number",
  obj: "object"
});

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
