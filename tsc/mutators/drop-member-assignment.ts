import * as R from "ramda";
import { MutatorPlugin } from "../types";
import NODE_TYPES from "../constants/node-types";

// drops a member assignment
// `obj.prop = 'value';` => `obj.prop;`
export default <MutatorPlugin>{
  name: "dropMemberAssignment",
  nodeTypes: [NODE_TYPES.AssignmentExpression],
  filter: function (node) {
    return R.path(["left", "type"], node) === NODE_TYPES.MemberExpression
  },
  mutator: function (node) {
    return (<ESTree.AssignmentExpression>node).left;
  },
};
