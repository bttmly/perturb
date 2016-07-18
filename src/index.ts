
import R = require("ramda");
import Bluebird = require("bluebird");
import { spawn } from "child_process";
import assert = require("assert");

import getRunner = require("./runners");
import getReporter = require("./reporters");
import getMatcher = require("./matchers");
import makeMutants = require("./make-mutants");
import makeConfig = require("./make-config");
import fileSystem = require("./file-system");

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
  const cfg = makeConfig(_cfg);

  console.log("init with config\n", cfg);

  const { setup, teardown, paths } = fileSystem(cfg);

  const matcher = getMatcher(cfg);
  const runner: RunnerPlugin = getRunner(cfg.runner);
  const reporter: ReporterPlugin = getReporter(cfg.reporter);

  // first run the tests, otherwise why bother at all?
  return runTest(cfg)
    // then, set up the "shadow" file system that we'll work against
    .then(() => setup())
    // read those "shadow" directories and find the source and test files
    .then(() => paths())
    // use the matcher function to group {sourceFile, testFiles}
    .then(function ({ sources, tests }) {
      const matches = matcher(sources, tests);
      const [tested, untested] = R.partition(hasTests, matches);
      // TODO -- surface untested file names somehow

      if (tested.length === 0) {
        throw new Error("No matched files!");
      }

      return tested;
    })
    //
    .then(R.chain(makeMutants))
    .then(sanityCheckAndSideEffects)
    // run the mutatnts and gather the results
    .then(function (ms: Mutant[]) {
      // this handler does all the interesting work on a single Mutant
      const handler = makeMutantHandler(runner, reporter);
      return Bluebird.mapSeries(ms, handler);
    })
    // run the final results handler, if supplied, then pass the results back
    // to the caller
    .then(function (rs: RunnerResult[]) {
      if (reporter.onFinish) {
        reporter.onFinish(rs);
      }
      return rs;
    })
    .catch(err => {
      console.log("ERROR IN PERTURB MAIN CHAIN", err);
      throw err;
    })
    .finally(teardown)
}

function makeMutantHandler (runner: RunnerPlugin, reporter: ReporterPlugin) {
  return function handler (m: Mutant): Promise<RunnerResult> {
    let _before, _result;
    return runner.setup(m)
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

function runTest (cfg: PerturbConfig) {
  return new Promise(function (resolve, reject) {
    const [cmd, ...rest] = cfg.testCmd.split(/\s+/);
    const child = spawn(cmd, rest);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on("close", function (code) {
      code === 0 ? resolve() : reject(new Error(`Test command exited with non-zero code: ${code}`));
    });
  });
}

// TODO -- what else? Any reason might want to serialize mutants here?
function sanityCheckAndSideEffects (ms: Mutant[]) {
  ms.forEach(function (m: Mutant) {
    assert.notEqual(m.mutatedSourceCode, "", "Mutated source code should not be empty.");
  });
  return ms;
}

Promise.prototype.finally = function (cb) {
  return this.then(
    value => this.constructor.resolve(cb()).then(() => value),
    reason => this.constructor.resolve(cb()).then(() => { throw reason; })
  );
}
