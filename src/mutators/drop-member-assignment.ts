import R = require("ramda");
import S = require("./_syntax");

// drops a member assignment
// `obj.prop = 'value';` => `obj.prop;`
export = <MutatorPlugin>{
  name: "drop-member-assignment",
  nodeTypes: [S.AssignmentExpression],
  filter: R.pathEq(["left", "type"], S.MemberExpression),
  mutator: R.prop("left"),
};
