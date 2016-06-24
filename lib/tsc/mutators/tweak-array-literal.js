"use strict";
const node_types_1 = require("../constants/node-types");
const R = require("ramda");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // drops the first declared element in an array literal
    // `['a', 'b']` => `['a']`
    name: "tweakArrayLiteral",
    nodeTypes: [node_types_1.default.ArrayExpression],
    filter: function (node) {
        return R.path(["elements", "length"], node) !== 0;
    },
    mutator: function (node) {
        return strategies.dropFirst(node);
    },
};
const strategies = {
    dropFirst: function (node) {
        return R.assoc("elements", node.elements.slice(1), node);
    },
    dropLast: function (node) {
        return R.assoc("elements", node.elements.slice(0, -1), node);
    },
    dropRandom: function (node) {
        return R.assoc("elements", dropRandom(node.elements), node);
    }
};
function dropRandom(arr) {
    var i = getRandomIndex(arr);
    var out = arr.slice();
    out.splice(i, 1);
    return out;
}
function getRandomIndex(arr) {
    return Math.floor(Math.random() * (arr.length));
}
