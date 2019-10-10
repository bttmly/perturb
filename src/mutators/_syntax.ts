// copied from https://github.com/estools/estraverse/blob/54d608c4ce0eb36d9bade685edcc3177e90e9f3c/estraverse.js#L75-L148
// the @types/estraverse package does not include this enum of node types

enum S {
  AssignmentExpression = "AssignmentExpression",
  AssignmentPattern = "AssignmentPattern",
  ArrayExpression = "ArrayExpression",
  ArrayPattern = "ArrayPattern",
  ArrowFunctionExpression = "ArrowFunctionExpression",
  AwaitExpression = "AwaitExpression", // CAUTION: It's deferred to ES7.
  BlockStatement = "BlockStatement",
  BinaryExpression = "BinaryExpression",
  BreakStatement = "BreakStatement",
  CallExpression = "CallExpression",
  CatchClause = "CatchClause",
  ClassBody = "ClassBody",
  ClassDeclaration = "ClassDeclaration",
  ClassExpression = "ClassExpression",
  ComprehensionBlock = "ComprehensionBlock",  // CAUTION: It's deferred to ES7.
  ComprehensionExpression = "ComprehensionExpression",  // CAUTION: It's deferred to ES7.
  ConditionalExpression = "ConditionalExpression",
  ContinueStatement = "ContinueStatement",
  DebuggerStatement = "DebuggerStatement",
  DirectiveStatement = "DirectiveStatement",
  DoWhileStatement = "DoWhileStatement",
  EmptyStatement = "EmptyStatement",
  ExportAllDeclaration = "ExportAllDeclaration",
  ExportDefaultDeclaration = "ExportDefaultDeclaration",
  ExportNamedDeclaration = "ExportNamedDeclaration",
  ExportSpecifier = "ExportSpecifier",
  ExpressionStatement = "ExpressionStatement",
  ForStatement = "ForStatement",
  ForInStatement = "ForInStatement",
  ForOfStatement = "ForOfStatement",
  FunctionDeclaration = "FunctionDeclaration",
  FunctionExpression = "FunctionExpression",
  GeneratorExpression = "GeneratorExpression",  // CAUTION: It"s deferred to ES7.
  Identifier = "Identifier",
  IfStatement = "IfStatement",
  ImportExpression = "ImportExpression",
  ImportDeclaration = "ImportDeclaration",
  ImportDefaultSpecifier = "ImportDefaultSpecifier",
  ImportNamespaceSpecifier = "ImportNamespaceSpecifier",
  ImportSpecifier = "ImportSpecifier",
  Literal = "Literal",
  LabeledStatement = "LabeledStatement",
  LogicalExpression = "LogicalExpression",
  MemberExpression = "MemberExpression",
  MetaProperty = "MetaProperty",
  MethodDefinition = "MethodDefinition",
  ModuleSpecifier = "ModuleSpecifier",
  NewExpression = "NewExpression",
  ObjectExpression = "ObjectExpression",
  ObjectPattern = "ObjectPattern",
  Program = "Program",
  Property = "Property",
  RestElement = "RestElement",
  ReturnStatement = "ReturnStatement",
  SequenceExpression = "SequenceExpression",
  SpreadElement = "SpreadElement",
  Super = "Super",
  SwitchStatement = "SwitchStatement",
  SwitchCase = "SwitchCase",
  TaggedTemplateExpression = "TaggedTemplateExpression",
  TemplateElement = "TemplateElement",
  TemplateLiteral = "TemplateLiteral",
  ThisExpression = "ThisExpression",
  ThrowStatement = "ThrowStatement",
  TryStatement = "TryStatement",
  UnaryExpression = "UnaryExpression",
  UpdateExpression = "UpdateExpression",
  VariableDeclaration = "VariableDeclaration",
  VariableDeclarator = "VariableDeclarator",
  WhileStatement = "WhileStatement",
  WithStatement = "WithStatement",
  YieldExpression = "YieldExpression",
};

export const LOOP_NODES = [S.WhileStatement, S.DoWhileStatement, S.ForStatement];

export const TEST_NODES = [S.IfStatement, S.ConditionalExpression, S.SwitchCase];

export const FUNC_NODES = [
  S.FunctionDeclaration,
  S.FunctionExpression,
  S.ArrowFunctionExpression,
];

export default S;