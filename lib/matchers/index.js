import * as R from "ramda";
function runComparative(compare, source, tests) {
    return tests.filter(t => compare(source, t));
}
function runGenerative(generate, source, tests) {
    const name = generate(source);
    return R.contains(name, tests) ? [name] : [];
}
export default function getMatcher(c) {
    const matcherPlugin = getMatcherPlugin(c.matcher);
    const { type } = matcherPlugin;
    const matcher = matcherPlugin.makeMatcher(c);
    return function findMatches(sources, tests) {
        const runMatch = type === "generative" ? runGenerative : runComparative;
        return sources.map(function (source) {
            return { source, tests: runMatch(matcher, source, tests) };
        });
    };
}
import baseGenerative from "./base-generative";
import baseComparative from "./base-comparative";
import containsComparative from "./contains-comparative";
const builtIns = new Map([
    ["base-generative", baseGenerative],
    ["base-comparative", baseComparative],
    ["contains-comparative", containsComparative],
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
