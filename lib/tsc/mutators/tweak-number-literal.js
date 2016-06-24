"use strict";
const node_types_1 = require("../constants/node-types");
const R = require("ramda");
module.exports = {
    // adds 1 to any number literal OR replaces 1 with 0
    // var num = 0; => var num = 1;
    // var x = 735; => var x = 736;
    name: "tweakNumberLiteral",
    nodeTypes: [node_types_1.default.Literal],
    filter: function (node) {
        return typeof node.value === "number";
    },
    mutator: function (node) {
        const { value } = node;
        return R.assoc("value", (value === 1 ? 0 : value + 1), node);
    },
};
