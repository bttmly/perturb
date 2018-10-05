import * as fs from "fs";
import * as R from "ramda";

import baseGenerative from "./base-generative";
import baseComparative from "./base-comparative";
import containsComparative from "./contains-comparative";

import {
  GenerativeMatcher,
  ComparativeMatcher,
  MatcherPlugin,
  PerturbConfig,
  Match,
} from "../types";

function runComparative(
  compare: ComparativeMatcher,
  source: string,
  tests: string[],
): string[] {
  return tests.filter(t => compare(source, t));
}

function runGenerative(
  generate: GenerativeMatcher,
  source: string,
  tests: string[],
): string[] {
  const name = generate(source);
  return R.contains(name, tests) ? [name] : [];
}

const builtIns = new Map<string, MatcherPlugin>([
  ["base-generative", baseGenerative],
  ["base-comparative", baseComparative],
  ["contains-comparative", containsComparative],
]);

export default function getMatcher(c: PerturbConfig) {
  const matcherPlugin = getMatcherPlugin(c.matcher);
  const { matchType } = matcherPlugin;
  const matcher = matcherPlugin.makeMatcher(c);
  return function findMatches(sources: string[], tests: string[]): Match[] {
    const runMatch: any =
      matchType === "generative" ? runGenerative : runComparative;
    return sources.map(source => ({
      source,
      tests: runMatch(matcher, source, tests),
      // TODO - right now I'm just shuffling this piece of I/O around to make something else
      // easier to test. Will have to put it somewhere permanent eventually, but this seems
      // best for right now
      sourceCode: fs.readFileSync(source).toString(),
    }));
  };
}

function getMatcherPlugin(input: string | MatcherPlugin): MatcherPlugin {
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
