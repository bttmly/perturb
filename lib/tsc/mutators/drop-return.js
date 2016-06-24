"use strict";
const NODE_TYPES = require("../constants/node-types");
const NODE_ATTRS = require("../constants/node-attrs");
const voidNode = require("./_void-node");
const R = require("ramda");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "dropReturn",
    nodeTypes: [NODE_TYPES.ReturnStatement],
    mutator: function (node) {
        if (node.argument == null)
            return voidNode;
        return {
            type: NODE_TYPES.ExpressionStatement,
            expression: node.argument,
        };
    },
};
