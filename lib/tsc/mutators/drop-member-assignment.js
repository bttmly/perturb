"use strict";
const R = require("ramda");
const node_types_1 = require("../constants/node-types");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "dropMemberAssignment",
    nodeTypes: [node_types_1.default.AssignmentExpression],
    filter: function (node) {
        return R.path(["left", "type"], node) === node_types_1.default.MemberExpression;
    },
    mutator: function (node) {
        return node.left;
    },
};
