import * as R from "ramda";
import S from "./_syntax";

import * as ESTree from "estree";
import { MutatorPlugin } from "../types";

// drops a member assignment
// `obj.prop = 'value';` => `obj.prop;`
const plugin: MutatorPlugin = {
  type: "mutator",
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
};

export default plugin;
