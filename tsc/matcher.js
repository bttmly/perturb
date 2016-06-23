import {MatcherPlugin} from "./types";

type match = { source: string, tests: string[] };

function runComparative (
  isMatch: (s: string, t: string) => boolean,
  source: Set<string>,
  tests: Set<string>
) : Array<string> {
  const ts = [];
  tests.forEach(t => isMatch(source, t) && ts.push(t));
  return ts;
}

function runGenerative (
  generateName: (s: string) => string,
  source: Set<string>,
  tests: Set<string>
): Array<string> {
  const name = generateName(source);
  return tests.has(name) ? [name] : [];
}

export function match (
  m: MatcherPlugin,
  sources: Set<string>,
  tests: Set<string>
): Array<match> {

  const {type, matcher} = m;
  const runMatch = type === "generative" ? runGenerative : runComparative;

  const ms: Array<match> = [];
  sources.forEach(function (source) {
    ms.push({ source, tests: runMatch(m.matcher, source, tests) })
  });
  return ms;
}