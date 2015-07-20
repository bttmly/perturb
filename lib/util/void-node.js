function voidNode () {
  return Immutable.fromJS({
    type: NODE_TYPES.UnaryExpression,
    operator: VOID,
    argument: {
      type: NODE_TYPES.Literal,
      value: 0,
      raw: "0"
    },
    prefix: true
  });
}

module.exports = voidNode;
