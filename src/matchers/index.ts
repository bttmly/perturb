import * as R from "ramda";

import baseGenerative = require("./base-generative");
import baseComparative = require("./base-comparative");
import containsComparative = require("./contains-comparative");

interface runMatcher {
  (matcher: ComparativeMatcher | GenerativeMatcher, source: string, tests: string[]): string[];
}

function runComparative (
  compare: ComparativeMatcher,
  source: string,
  tests: string[]
) : string[] {
  return tests.filter(t => compare(source, t));
}

function runGenerative (
  generate: GenerativeMatcher,
  source: string,
  tests: string[]
): string[] {
  const name = generate(source);
  return R.contains(name, tests) ? [name] : [];
}

const builtIns = new Map<string, MatcherPlugin>([
  ["base-generative", baseGenerative],
  ["base-comparative", baseComparative],
  ["contains-comparative", containsComparative],
]);

function getMatcher (c: PerturbConfig) {
  const matcherPlugin = getMatcherPlugin(c.matcher);
  const {type} = matcherPlugin;
  const matcher = matcherPlugin.makeMatcher(c);
  
  return function findMatches (sources: string[], tests: string[]): Match[] {
    const runMatch: runMatcher = type === "generative" ? runGenerative : runComparative;
    return sources.map(source => ({
      source, tests: runMatch(matcher, source, tests),
    }));
  }
}

function getMatcherPlugin (input: string | MatcherPlugin): MatcherPlugin {
  if (typeof input === "string") {
    const plugin = builtIns.get(input);
    
    if (plugin) return plugin;
    
    try {
      // TODO -- runtime type check this import
      return require(`perturb-matcher-plugin-${input}`);
    } catch (err) {
      console.log("Fatal error: unable to resolve MATCHER plugin name", input);
      throw err;
    }
  } else {
    return input;
  }
}

export = getMatcher;
