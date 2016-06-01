"use strict";

var NODE_TYPES = require("../constants/node-types");

// drops a member assignment
// `obj.prop = 'value';` => `obj.prop;`
module.exports = {
  name: "dropMemberAssignment",
  type: NODE_TYPES.AssignmentExpression,
  nodeType: NODE_TYPES.AssignmentExpression,
  filter (node) {
    return node.getIn(["left", "type"]) === NODE_TYPES.MemberExpression;
  },
  mutator (node) {
    return node.get("left");
  },
};
