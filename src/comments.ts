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

function extractOperators (c: Comment) {
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

function getComments (node: CommentedNode) {
  return (new Array<Comment>()).concat(
    node.leadingComments || [],
    node.trailingComments || []
  );
}

// a little class to encapsulate how mutators get enabled/disabled
class CommentManager {
  _disabled: Set<string>;

  constructor (set?: Set<string>) {
    this._disabled = set || new Set<string>();
  }

  applyNode = (_node: ESTree.Node) => {
    R.pipe(
      getComments,
      R.chain(extractOperators),
      R.forEach(this._applyOperator),
    )(<CommentedNode>_node);
  }

  _applyOperator = (op: Operator) => {
    switch (op.type) {
      case "enable": {
        this._disabled.delete(op.name);
        return;
      }
      case "disable": {
        this._disabled.add(op.name);
        return;
      }
    }
  }

  isEnabled = (name: string) => {
    return !this._disabled.has(name);
  }

  isDisabled = (name: string) => {
    return this._disabled.has(name);
  }

  toArray () {
    return [...this._disabled];
  }
}

export = CommentManager;

