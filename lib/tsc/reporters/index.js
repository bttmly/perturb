"use strict";
const diffReporter = require("./diff");
const plugins = new Map([
    ["diff", diffReporter],
]);
function locateReporterPlugins(names) {
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
module.exports = function get(name) {
    const p = plugins.get(name);
    if (p == null) {
        throw new Error(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
    }
    return p;
};
