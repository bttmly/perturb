import R = require("ramda");
import * as ESTree from "estree"

const ENABLING_COMMENT = "perturb-enable:";
const DISABLING_COMMENT = "perturb-disable:";

const ENABLE = Symbol("ENABLE");
const DISABLE = Symbol("DISABLE");

interface Operator {
  type: symbol;
  name: string;
}

function extractOperators (c: ESTree.Comment): Array<Operator> {
  const value = c.value.trim();

  const type = value.startsWith(ENABLING_COMMENT) ?
    ENABLE : value.startsWith(DISABLING_COMMENT) ?
    DISABLE : null;

  if (type == null) return [];

  const [, allNames] = value.split(":");

  if (!allNames) return [];

  return allNames
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(name => ({ type, name: String(name) }))
}

// a little class to encapsulate how mutators get enabled/disabled
// NOTE: I would like to use BaseNode here but it is not exported. BaseStatement
// is an empty extends from BaseNode, so we'll use that
class CommentManager {
  _disabled: Set<string>;

  constructor (set?: Set<string>) {
    this._disabled = set || new Set<string>();
  }

  applyLeading = (node: ESTree.BaseStatement) => {
    this._applyComments(node.leadingComments || []);
  }

  applyTrailing = (node: ESTree.BaseStatement) => {
    this._applyComments(node.trailingComments || []);
  }

  isDisabled = (name: string) => this._disabled.has(name);

  isEnabled = (name: string) => !this.isDisabled(name);

  toArray = () => [...this._disabled];

  _applyComments (cs: Array<ESTree.Comment>) {
    R.chain(extractOperators, cs).forEach((op: Operator) => this._applyOperator(op))
    return null
  }

  _applyOperator (op: Operator) {
    switch (op.type) {
      case ENABLE: {
        // debug("enabling", op.name);
        this._disabled.delete(op.name); break;
      }
      case DISABLE: {
        // debug("disabling", op.name);
        this._disabled.add(op.name);
      }
    }
  }
}

export = CommentManager;

