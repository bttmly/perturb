import R = require("ramda");

const PERTURB_ENABLE = "perturb-enable:";
const PERTURB_DISABLE = "perturb-disable:";

interface Operator {
  type: string;
  name: string;
}

interface Comment {
  type: string;
  value: string;
  range: number[];
}

interface CommentedNode extends ESTree.Node {
  leadingComments?: Comment[];
  trailingComments?: Comment[];
}

function applyNodeComments (_node: ESTree.Node, disabledSet: Set<string>) {
  const node = <CommentedNode>_node;
  R.pipe(
    _getComments,
    R.chain(_extractOperators),
    R.forEach(_applyOperator(disabledSet))
  )(node);
}

const _applyOperator = R.curry(function (set: Set<string>, op: Operator) {
  switch (op.type) {
    case "enable": {
      console.log("ENABLE", op.name)
      return set.add(op.name);
    }
    case "disable": {
      console.log("DISABLE", op.name);
      return set.delete(op.name);
    }
  }
});

function _getComments (node: CommentedNode): Comment[] {
  return [].concat(
    node.leadingComments || [],
    node.trailingComments || []
  );
}

function _extractOperators (c: Comment): Operator[] {
  const value = c.value.trim();

  console.log("RAW VALUE", value);

  let type;
  if (value.startsWith(PERTURB_ENABLE)) {
    type = "enable";
  } else if (value.startsWith(PERTURB_DISABLE)) {
     type = "disable";
  }
  if (type == null) return null;

  return R.pipe(
    R.split(":"),
    R.prop("1"),
    R.split(","),
    R.filter(Boolean),
    R.map(R.trim),
    R.map(name => ({ type, name: String(name) }))
  )(value);
}

export = {
  _getComments,
  _extractOperators,
  _applyOperator,
  applyNodeComments,
};  