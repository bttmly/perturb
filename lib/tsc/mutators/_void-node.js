"use strict";
const node_types_1 = require("../constants/node-types");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: node_types_1.default.UnaryExpression,
    operator: "void",
    prefix: true,
    argument: {
        type: node_types_1.default.Literal,
        value: 0,
    }
};
