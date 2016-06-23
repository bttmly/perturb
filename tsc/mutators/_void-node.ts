import NODE_TYPES from "../constants/node-types";

export default <ESTree.UnaryExpression>{
  type: NODE_TYPES.UnaryExpression,
  operator: "void",
  prefix: true,
  argument: <ESTree.Literal>{
    type: NODE_TYPES.Literal,
    value: 0,
  }
};

