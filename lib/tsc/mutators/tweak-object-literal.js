"use strict";
const node_types_1 = require("../constants/node-types");
const R = require("ramda");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // drops the first declared property in an object literal
    // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
    name: "tweakObjectLiteral",
    nodeTypes: [node_types_1.default.ObjectExpression],
    filter: function (node) {
        return R.path(["properties", "length"], node) !== 0;
    },
    mutator: function (node) {
        return strategies.dropFirst(node);
    },
};
// TODO -- DRY this up w/ array literal tweak mutator and string mutator
const strategies = {
    dropFirst: function (node) {
        return R.assoc("properties", node.properties.slice(1), node);
    },
    dropLast: function (node) {
        return R.assoc("properties", node.properties.slice(0, -1), node);
    },
    dropRandom: function (node) {
        return R.assoc("properties", dropRandom(node.properties), node);
    }
};
function dropRandom(s) {
    const pos = Math.round(Math.random() * s.length - 1);
    return s.slice(0, pos) + s.slice(pos + 1);
}
