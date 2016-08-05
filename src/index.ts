import R = require("ramda");
import Bluebird = require("bluebird");
import { spawn } from "child_process";
import fs = require("fs");
import assert = require("assert");

import getRunner = require("./runners");
import getReporter = require("./reporters");
import getMatcher = require("./matchers");
import makeMutants = require("./make-mutants");
import makeConfig = require("./make-config");
import fileSystem = require("./file-system");
import runMutant = require("./util/run-mutant");
import astPaths = require("./ast-paths");
import mutators = require("./mutators");

function hasTests (m: Match): boolean {
  return Boolean(R.path(["tests", "length"], m));
}

function perturb (_cfg: PerturbConfig) {
  const cfg = makeConfig(_cfg);

  console.log("init with config\n", cfg);

  const { setup, teardown, paths } = fileSystem(cfg);

  const matcher = getMatcher(cfg);
  const runner = getRunner(cfg.runner);
  const reporter = getReporter(cfg.reporter);
  
  const handler = makeMutantHandler(runner, reporter);
  
  let start;

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
      console.log("untested files:", untested.map(m => m.source).join("\n"));

      if (tested.length === 0) {
        throw new Error("No matched files!");
      }

      start = Date.now();

      const finder = astPaths(mutators.getMutatorsForNode)
      return R.chain(makeMutants(finder), tested);
    })
    .then(sanityCheckAndSideEffects)
    // run the mutatnts and gather the results
    .then(function (ms: Mutant[]) {
      return Bluebird.mapSeries(ms, handler);
    })
    // run the final results handler, if supplied, then pass the results back
    // to the caller
    .then(function (rs: RunnerResult[]) {
      // some run metadata here:
      // duration: number
      // runner: string
      // sourceCount: number

      const duration = (Date.now() - start) / 1000;
      console.log("duration:", duration, "rate:", (rs.length / duration), "/s");

      if (reporter.onFinish) {
        reporter.onFinish(rs);
      }
      return rs;
    })
    .finally(teardown)
}

function makeMutantHandler (runner: RunnerPlugin, reporter: ReporterPlugin) {
  return async function handler (mutant: Mutant): Promise<RunnerResult> {
    const result = await runMutant(runner, mutant);
    reporter.onResult && reporter.onResult(result);
    return result;
  }
}

function runTest (cfg: PerturbConfig) {
  return new Promise(function (resolve, reject) {
    const [cmd, ...rest] = cfg.testCmd.split(/\s+/);
    const child = spawn(cmd, rest);
    // child.stdout.pipe(process.stdout);
    // child.stderr.pipe(process.stderr);
    child.on("close", function (code) {
      code === 0 ? resolve() : reject(new Error(`Test command exited with non-zero code: ${code}`));
    });
  });
}

// TODO -- what else? Any reason might want to serialize mutants here?
function sanityCheckAndSideEffects (ms: Mutant[]): Promise<Mutant[]> {
  ms.forEach(function (m: Mutant) {
    assert.notEqual(m.mutatedSourceCode, "", "Mutated source code should not be empty.");
  });
  return Promise.resolve(ms);
}

Promise.prototype.finally = function (cb) {
  return this.then(
    value => this.constructor.resolve(cb()).then(() => value),
    reason => this.constructor.resolve(cb()).then(() => { throw reason; })
  );
}

export = perturb;
