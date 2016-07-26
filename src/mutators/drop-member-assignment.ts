const R = require("ramda");
const { Syntax } = require("estraverse");

import { MutatorPlugin } from "../types";

// drops a member assignment
// `obj.prop = 'value';` => `obj.prop;`
export = <MutatorPlugin>{
  name: "drop-member-assignment",
  nodeTypes: [Syntax.AssignmentExpression],
  filter: function (node) {
    return R.path(["left", "type"], node) === Syntax.MemberExpression
  },
  mutator: function (node) {
    return (<ESTree.AssignmentExpression>node).left;
  },
};
