"use strict";
const node_types_1 = require("../constants/node-types");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "dropOperator",
    nodeTypes: [
        node_types_1.default.ThrowStatement,
        node_types_1.default.UnaryExpression,
    ],
    mutator: function (node) {
        return node.argument;
    },
};
