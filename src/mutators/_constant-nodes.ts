import S = require("./_syntax");
import * as ESTree from "estree";

export const VOID_NODE: ESTree.UnaryExpression = {
  type: S.UnaryExpression,
  operator: "void",
  prefix: true,
  argument: <ESTree.Literal>{
    type: S.Literal,
    value: 0,
  }
};

export const FALSE_NODE: ESTree.Literal = {
  type: S.Literal,
  value: false,
  raw: "false",
};

export const TRUE_NODE: ESTree.Literal = {
  type: S.Literal,
  value: true,
  raw: "true",
};
