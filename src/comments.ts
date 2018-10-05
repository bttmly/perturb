import * as R from "ramda";
import * as ESTree from "estree";

const ENABLING_COMMENT = "perturb-enable:";
const DISABLING_COMMENT = "perturb-disable:";

export enum CommentType {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export interface Operator {
  type: CommentType;
  name: string;
}

// a little class to encapsulate how mutators get enabled/disabled
export default class CommentManager {
  _disabled: Set<string>;

  constructor(set?: Set<string>) {
    this._disabled = set || new Set<string>();
  }

  // NOTE: I would like to use BaseNode here but it is not exported. BaseStatement
  // is an empty extends from BaseNode, so we'll use that
  applyLeading = (node: ESTree.BaseStatement) => {
    this._applyComments(node.leadingComments || []);
  }

  applyTrailing = (node: ESTree.BaseStatement) => {
    this._applyComments(node.trailingComments || []);
  }

  isDisabled = (name: string) => this._disabled.has(name);

  isEnabled = (name: string) => !this.isDisabled(name);

  toArray = () => [...this._disabled];

  _applyComments(cs: ESTree.Comment[]) {
    R.chain(extractOperators, cs).forEach((op: Operator) =>
      this._applyOperator(op),
    );
    return null;
  }

  _applyOperator(op: Operator) {
    switch (op.type) {
      case CommentType.ENABLE: {
        return void this._disabled.delete(op.name);
      }
      case CommentType.DISABLE: {
        return void this._disabled.add(op.name);
      }
    }
    return assertUnreachable(op.type);
  }
}

function extractOperators(c: ESTree.Comment): Operator[] {
  const value = c.value.trim();

  const type = value.startsWith(ENABLING_COMMENT)
    ? CommentType.ENABLE
    : value.startsWith(DISABLING_COMMENT) ? CommentType.DISABLE : null;

  if (type == null) return [];

  const [, allNames] = value.split(":").filter(Boolean);

  if (!allNames) return [];

  return allNames
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(name => ({ type, name }));
}

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
