import S = require("./_syntax");

export = <ESTree.UnaryExpression>{
  type: S.UnaryExpression,
  operator: "void",
  prefix: true,
  argument: <ESTree.Literal>{
    type: S.Literal,
    value: 0,
  }
};

