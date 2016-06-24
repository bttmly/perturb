"use strict";
const node_types_1 = require("../constants/node-types");
const node_attrs_1 = require("../constants/node-attrs");
const R = require("ramda");
const AND = "&&";
const OR = "||";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "swapLogicalOperators",
    nodeTypes: [node_types_1.default.LogicalExpression],
    mutator: function (node) {
        const prevOp = node[node_attrs_1.default.operator];
        const newOp = (prevOp === AND ? OR : AND);
        return R.assoc(node_attrs_1.default.operator, newOp, node);
    },
};
