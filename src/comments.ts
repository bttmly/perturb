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

// a little class to encapsulate how mutators get enabled/disabled
class CommentManager {
  _set: Set<string>;

  static extractOperators (c: Comment): Operator[]  {
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

  static getComments (node: CommentedNode): Comment[] {
    return (new Array<Comment>()).concat(
      node.leadingComments || [],
      node.trailingComments || []
    );
  }

  constructor (set?: Set<string>) {
    this._set = set || new Set<string>();
  }

  applyNode = (_node: ESTree.Node) => {
    R.pipe(
      CommentManager.getComments,
      R.chain(CommentManager.extractOperators),
      R.forEach(this._applyOperator),
    )(<CommentedNode>_node);
  }

  hasName = (name: string) => {
    return this._set.has(name);
  }

  // --perturb-disable: drop-return
  // --perturb-enable: drop-return
  _applyOperator = (op: Operator) => {
    switch (op.type) {
      case "enable": {
        this._set.add(op.name);
        return;
      }
      case "disable": {
        this._set.delete(op.name);
        return;
      }
    }
  }

  [Symbol.iterator] () {
    return this._set[Symbol.iterator]();
  }
}

export = CommentManager;

