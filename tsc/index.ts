///<reference path="../typings/globals/node/index.d.ts"/>
///<reference path="../typings/globals/bluebird/index.d.ts"/>
///<reference path="../typings/modules/ramda/index.d.ts"/>

const R = require("ramda");
const Bluebird = require("bluebird");

const getRunner = require("./runners");
const getReporter = require("./reporters");
const getMatcher = require("./matchers");
const makeMutants = require("./make-mutants");
const makeConfig = require("./make-config");
const fileSystem = require("./file-system");

import {
  PerturbConfig,
  MatcherPlugin,
  ReporterPlugin,
  RunnerPlugin,
  RunnerResult,
  Mutant,
  Match,
} from "./types";

function hasTests (m: Match): boolean {
  return Boolean(R.path(["tests", "length"], m));
}

module.exports = function perturb (_cfg: PerturbConfig) {
  console.log("START...");

  const cfg = makeConfig(_cfg);

  const {setup, teardown, paths} = fileSystem(cfg);

  const matcher = getMatcher(cfg);
  const runner: RunnerPlugin = getRunner(cfg.runner);
  const reporter: ReporterPlugin = getReporter(cfg.reporter);

  // this handler does all the interesting work on a single Mutant
  const handler = makeMutantHandler(runner, reporter);

  // first, set up the "shadow" file system that we'll work against
  return Promise.resolve(setup())
    // read those "shadow" directories and find the source and test files
    .then(() => paths())
    // use the matcher function to group {sourceFile, testFiles}
    .then(function ({ sources, tests }) {
      const matches = matcher(sources, tests);
      const [tested, untested] = R.partition(hasTests, matches);
      // TODO -- surface untested file names somehow
      return tested;
    })
    // 
    .then(makeMutants)
    .then(function (ms: Mutant[]) {
      // TODO -- right here we can serialize all the mutants before running them
      // any reason we might want to do this?
      // 
      // this is the separation point between pure data and actually executing
      // the tests against mutated source code
      return ms;
    })
    // crank the mutants through the handler and gather the results
    .then(function (ms: Mutant[]) {
      return Bluebird.mapSeries(ms, handler);
    })
    // run the final results handler, if supplied, then pass the results back
    // to the caller
    .then(function (rs: RunnerResult[]) {
      if (reporter.onFinish) {
        reporter.onFinish(rs);
      }
      return rs;
    });
}

function makeMutantHandler (runner: RunnerPlugin, reporter: ReporterPlugin) {
  return function handler (m: Mutant): Promise<RunnerResult> {
    let _before, _result;
    return runner.prepare(m)
      .then(before => {
        _before = before;
        return runner.run(m)
      })
      .then(result => {
        _result = result;
        return runner.cleanup(result, _before);
      })
      .then(() => {
        if (reporter.onResult) {
          reporter.onResult(_result);
        }
        return _result;
      })
  }
}
