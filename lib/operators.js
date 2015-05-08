var UnaryOperator = ["-", "+", "!", "~", "typeof", "void", "delete"];

var BinaryOperator = ["==", "!=", "===", "!==", "<", "<=", ">", ">=", "<<", ">>", ">>>", "+", "-", "*", "/", "%", "|", "^", "&", "in", "instanceof", ".."];

var LogicalOperator = ["||", "&&"];

var AssignmentOperator = ["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&="];

var UpdateOperator = ["++", "--"];

module.exports = {
  UNARY: UnaryOperator,
  BINARY: BinaryOperator,
  UPDATE: UpdateOperator,
  LOGICAL: LogicalOperator,
  ASSIGNMENT: AssignmentOperator
};