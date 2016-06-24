"use strict";
const R = require("ramda");
const node_types_1 = require("../constants/node-types");
const node_attrs_1 = require("../constants/node-attrs");
const test_nodes_1 = require("../constants/test-nodes");
const BANG = "!";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "invertConditionalTest",
    nodeTypes: Object.keys(test_nodes_1.default),
    filter: function (node) {
        // using get() over has() ensures it isn't null (switch case `default`!)
        return Boolean(R.prop(node_attrs_1.default.test, node));
    },
    mutator: function (node) {
        return R.assoc(node_attrs_1.default.test, {
            type: node_types_1.default.UnaryExpression,
            operator: BANG,
            argument: node[node_attrs_1.default.test],
        }, node);
    },
};
