"use strict";

var NODE_TYPES = require("../constant/node-types");

module.exports = {
  // drops a member assignment
  // `obj.prop = 'value';` => `obj.prop;`
  name: "dropMemberAssignment",
  type: NODE_TYPES.AssignmentExpression,
  nodeType: NODE_TYPES.AssignmentExpression,
  filter: function (node) {
    return node.getIn(["left", "type"]) === NODE_TYPES.MemberExpression;
  },
  mutator: function (node) {
    return node.get("left");
  },
};
