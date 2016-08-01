///<reference path="../perturb.d.ts" />

import R = require("ramda");
import S = require("./_syntax");

// drops a member assignment
// `obj.prop = 'value';` => `obj.prop;`
export = <MutatorPlugin>{
  name: "drop-member-assignment",
  nodeTypes: [S.AssignmentExpression],
  filter: function (node) {
    return R.path(["left", "type"], node) === S.MemberExpression
  },
  mutator: function (node) {
    return (<ESTree.AssignmentExpression>node).left;
  },
};
