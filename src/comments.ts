import R = require("ramda");
const debug = require("debug")("comments");

const ENABLING_COMMENT = "perturb-enable:";
const DISABLING_COMMENT = "perturb-disable:";

const ENABLE = Symbol("ENABLE");
const DISABLE = Symbol("DISABLE");

interface Operator {
  type: symbol;
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

  const type = value.startsWith(ENABLING_COMMENT) ?
    ENABLE : value.startsWith(DISABLING_COMMENT) ?
    DISABLE : null;

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

  applyLeading = (node: CommentedNode) => {
    this._applyComments(node.leadingComments || []);
  }

  applyTrailing = (node: CommentedNode) => {
    this._applyComments(node.trailingComments || []);
  }

  isDisabled = (name: string) => this._disabled.has(name);

  isEnabled = (name: string) => !this.isDisabled(name);

  toArray = () => [...this._disabled];

  _applyComments (cs: Comment[]) {
    R.chain(extractOperators, cs).forEach(op => this._applyOperator(op))
  }

  _applyOperator (op: Operator) {
    switch (op.type) {
      case ENABLE: {
        debug("enabling", op.name);
        this._disabled.delete(op.name); break;
      }
      case DISABLE: {
        debug("disabling", op.name);
        this._disabled.add(op.name); break;
      }
    }
  }
}

export = CommentManager;

