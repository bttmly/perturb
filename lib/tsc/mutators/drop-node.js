"use strict";
const node_types_1 = require("../constants/node-types");
const _void_node_1 = require("./_void-node");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "dropNode",
    nodeTypes: [
        node_types_1.default.ContinueStatement,
        node_types_1.default.BreakStatement,
    ],
    mutator: function () { return _void_node_1.default; },
};
