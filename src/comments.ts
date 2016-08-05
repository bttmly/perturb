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
  R.pipe(
    getComments,
    R.chain(extractOperators),
    R.forEach(applyOperator(disabledSet))
  )(<CommentedNode>_node);
}

const applyOperator = R.curry(function (set: Set<string>, op: Operator) {
  // perturb-disable: drop-return
  switch (op.type) {
    case "enable": {
      // console.log("ENABLE", op.name)
      return set.add(op.name);
    }
    case "disable": {
      // console.log("DISABLE", op.name);
      return set.delete(op.name);
    }
  }
  // perturb-enable: drop-return
});

function getComments (node: CommentedNode): Comment[] {
  const out: Comment[] = [];
  return out.concat(
    node.leadingComments || [],
    node.trailingComments || []
  );
}

function extractOperators (c: Comment): Operator[] {
  const value = c.value.trim();

  const type = value.startsWith(PERTURB_ENABLE) ?
    "enable" : value.startsWith(PERTURB_DISABLE) ?
    "disable" : null;

  if (type == null) return [];

  return R.pipe(
    R.split(":"),
    R.prop("1"),
    R.split(","),
    R.map(R.trim),
    R.filter(Boolean),
    R.map(name => ({ type, name: String(name) }))
  )(value);
}

export = applyNodeComments;
