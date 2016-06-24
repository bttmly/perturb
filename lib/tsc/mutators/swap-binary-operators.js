"use strict";
const binary_operator_swaps_1 = require("../constants/binary-operator-swaps");
const node_types_1 = require("../constants/node-types");
const node_attrs_1 = require("../constants/node-attrs");
const R = require("ramda");
const NO_SWAP = {
    instanceof: "instanceof",
    in: "in",
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "swapBinaryOperators",
    nodeTypes: [node_types_1.default.BinaryExpression],
    filter: function (node) {
        const op = R.prop(node_attrs_1.default.operator, node);
        return !R.has(op, NO_SWAP);
    },
    mutator: function (node) {
        var prevOp = node[node_attrs_1.default.operator];
        var newOp = binary_operator_swaps_1.default[prevOp];
        return R.assoc(node_attrs_1.default.operator, newOp, node);
    },
};
