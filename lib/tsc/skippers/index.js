"use strict";
const node_types_1 = require("../constants/node-types");
const js_types_1 = require("../constants/js-types");
function skipRequire(node) {
    const funcNode = node;
    return (funcNode.type === node_types_1.default.CallExpression &&
        funcNode.callee.name === "require" &&
        funcNode.arguments.length === 1 &&
        funcNode.arguments[0].type === node_types_1.default.Literal &&
        typeof funcNode.arguments[0].type === js_types_1.default.str);
}
function skipUseStrict(node) {
    const exprNode = node;
    return (exprNode.type === node_types_1.default.ExpressionStatement &&
        exprNode.expression.value === "use strict");
}
const skippers = [skipRequire, skipUseStrict];
function injectPlugins(names) {
    names.forEach(function (name) {
        let plugin;
        try {
            plugin = require(`perturb-plugin-skipper-${name}`);
            skippers.push(plugin);
        }
        catch (err) {
            // any way to recover? other locate strategy?
            console.log(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
            throw err;
        }
    });
}
exports.injectPlugins = injectPlugins;
function shouldSkip(node, path) {
    return skippers.some(f => f(node, path));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldSkip;
