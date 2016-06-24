"use strict";
const node_attrs_1 = require("../constants/node-attrs");
const func_nodes_1 = require("../constants/func-nodes");
const R = require("ramda");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "reverseFunctionParameters",
    nodeTypes: Object.keys(func_nodes_1.default),
    filter: function (node) {
        return R.path([node_attrs_1.default.params, "length"], node) > 1;
    },
    mutator: function (node) {
        const params = node.params.slice().reverse();
        return R.assoc(node_attrs_1.default.params, params, node);
    },
};
