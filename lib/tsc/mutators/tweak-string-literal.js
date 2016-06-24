"use strict";
const node_types_1 = require("../constants/node-types");
const R = require("ramda");
const EMPTY_REPLACEMENT = "a";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // drops first character of non-empty string; changes
    // empty strings to "a"
    // var s = ""; => var s = "a";
    // var name = "nick"; => var name = "ick";
    name: "tweakStringLiteral",
    nodeTypes: [node_types_1.default.Literal],
    filter: function (node) {
        return typeof node.value === "string";
    },
    mutator: function (node) {
        const { value } = node;
        const replacement = value.length ? value.slice(1) : EMPTY_REPLACEMENT;
        return R.assoc("value", replacement, node);
    },
};
