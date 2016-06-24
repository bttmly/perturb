"use strict";
const R = require("ramda");
function runComparative(compare, source, tests) {
    return tests.filter(t => compare(source, t));
}
function runGenerative(generate, source, tests) {
    const name = generate(source);
    return R.contains(name, tests) ? [name] : [];
}
function getMatcher(c) {
    const matcherPlugin = getMatcherPlugin(c.matcher);
    const { type } = matcherPlugin;
    const matcher = matcherPlugin.makeMatcher(c);
    return function findMatches(sources, tests) {
        const runMatch = type === "generative" ? runGenerative : runComparative;
        return sources.map(function (source) {
            return { source: source, tests: runMatch(matcher, source, tests) };
        });
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getMatcher;
const base_generative_1 = require("./base-generative");
const base_comparative_1 = require("./base-comparative");
const contains_comparative_1 = require("./contains-comparative");
const builtIns = new Map([
    ["base-generative", base_generative_1.default],
    ["base-comparative", base_comparative_1.default],
    ["contains-comparative", contains_comparative_1.default],
]);
function getMatcherPlugin(name) {
    const plugin = builtIns.get(name);
    if (plugin)
        return plugin;
    try {
        // TODO -- runtime type check this import
        return require(`perturb-matcher-plugin-${name}`);
    }
    catch (err) {
        console.log("Fatal error: unable to resolve MATCHER plugin name", name);
        throw err;
    }
}
