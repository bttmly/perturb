import * as R from "ramda";

import {
  PerturbConfig,
  MatcherPlugin,
  ComparativeMatcher,
  GenerativeMatcher,
  Match
} from "../types";

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

module.exports = function getMatcher (c: PerturbConfig) {

  const matcherPlugin = getMatcherPlugin(c.matcher);
  const {type} = matcherPlugin;
  const matcher = matcherPlugin.makeMatcher(c);

  return function findMatches (sources: string[], tests: string[]): Match[] {
    const runMatch: runMatcher = type === "generative" ? runGenerative : runComparative;
    return sources.map(function (source) {
      return <Match>{ source, tests: runMatch(matcher, source, tests) };
    });
  }
}

const baseGenerative = require("./base-generative");
const baseComparative = require("./base-comparative");
const containsComparative = require("./contains-comparative");

const builtIns = new Map<string, MatcherPlugin>([
  ["base-generative", baseGenerative],
  ["base-comparative", baseComparative],
  ["contains-comparative", containsComparative],
]);

function getMatcherPlugin (name): MatcherPlugin {
  const plugin = builtIns.get(name);
  if (plugin) return plugin;

  try {
    // TODO -- runtime type check this import
    return require(`perturb-matcher-plugin-${name}`);
  } catch (err) {
    console.log("Fatal error: unable to resolve MATCHER plugin name", name);
    throw err;
  }
}