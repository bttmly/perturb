"use strict";
const node_types_1 = require("../constants/node-types");
const R = require("ramda");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "tweakBooleanLiteral",
    nodeTypes: [node_types_1.default.Literal],
    filter: function (node) {
        const { value } = node;
        return value === true || value === false;
    },
    mutator: function (node) {
        const { value } = node;
        return R.assoc("value", !value, node);
    },
};
