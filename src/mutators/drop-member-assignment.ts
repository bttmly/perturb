import * as R from "ramda";
import S from "./_syntax";
import * as ESTree from "estree";
import createMutatorPlugin from "../make-mutator-plugin";

// drops a member assignment
// `obj.prop = 'value';` => `obj.prop;`
export default createMutatorPlugin({
  name: "drop-member-assignment",
  nodeTypes: [S.AssignmentExpression],
  filter(node: ESTree.Node) {
    const leftType = R.path(["left", "type"], node);
    return leftType === S.MemberExpression;
  },
  // TODO: how to not use `any` here?
  mutator(node: any): ESTree.Node {
    return node.left;
  },
});
