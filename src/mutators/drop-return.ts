import R = require("ramda");
import S = require("./_syntax");
import voidNode = require("./_void-node");

// drop return w/o affecting the rest of the expression/statement
// if return statement has no argument, instead transform it into `void 0;`
// `return something;` => `something;`
// `return;` => `void 0;`

interface MaybeArgumentedNode extends ESTree.Node {
  argument?: any
}

export = <MutatorPlugin>{
  name: "drop-return",
  nodeTypes: [S.ReturnStatement],
  mutator: R.ifElse(
    node => node.argument == null,
    () => voidNode,
    node => ({
      type: S.ExpressionStatement,
      expression: node.argument,
    })
  ),
};


