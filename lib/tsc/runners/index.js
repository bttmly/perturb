"use strict";
const mocha_1 = require("./mocha");
const plugins = new Map([
    ["mocha", mocha_1.default],
]);
function injectPlugins(names) {
    names.forEach(function (name) {
        let plugin;
        try {
            plugin = require(`perturb-plugin-runner-${name}`);
            plugins.set(name, plugin);
            return;
        }
        catch (err) {
            // any way to recover? other locate strategy?
            console.log(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
            throw err;
        }
    });
}
exports.injectPlugins = injectPlugins;
function get(name) {
    const plugin = plugins.get(name);
    if (plugin == null) {
        throw new Error(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
    }
    return plugin;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = get;
