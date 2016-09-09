import R = require("ramda");
import Bluebird = require("bluebird");
import { spawn } from "child_process";
import fs = require("fs");
import assert = require("assert");

import getRunner = require("./runners");
import getReporter = require("./reporters");
import getMatcher = require("./matchers");
import locationFilter = require("./filters");
import makeMutants = require("./make-mutants");
import makeConfig = require("./make-config");
import fileSystem = require("./file-system");
import runMutant = require("./util/run-mutant");
import astPaths = require("./ast-paths");
import mutators = require("./mutators");
import parseMatch = require("./parse-match");

function hasTests (m: Match): boolean {
  return Boolean(R.path(["tests", "length"], m));
}

const mapSeriesP = R.curry(R.flip(Bluebird.mapSeries));

async function perturb (_cfg: PerturbConfig) {
  const cfg = makeConfig(_cfg);

  console.log("init with config\n", cfg);

  const { setup, teardown, paths } = fileSystem(cfg);

  const matcher = getMatcher(cfg);
  const runner = getRunner(cfg.runner);
  const reporter = getReporter(cfg.reporter);
  const handler = makeMutantHandler(runner, reporter);
  const locator = astPaths(mutators.getMutatorsForNode);

  let start;

  const testRun: Promise<void> = process.env.SKIP_TEST ? Promise.resolve() : runTest(cfg);

  // first run the tests, otherwise why bother at all?
  return testRun
    // then, set up the "shadow" file system that we'll work against
    .then(() => setup())
    // read those "shadow" directories and find the source and test files
    .then(() => paths())
    // use the matcher function to group {sourceFile, testFiles}
    .then(function ({ sources, tests }) {
      // TODO -- this section has become a catch-all for various crap that
      // is actually orthogonal (tested/untested, start time, logging)
      const matches = matcher(sources, tests);

      const [tested, untested] = R.partition(hasTests, matches);

      // TODO -- surface untested file names somehow
      // console.log("untested files:", untested.map(m => m.source).join("\n"));

      if (tested.length === 0) {
        throw new Error("No matched files!");
      }

      const parsedMatches = tested.map(parseMatch(locator));
      const parsedMatchesAfterFilter = parsedMatches.map(_pm => {
        const pm = Object.assign({}, _pm);
        pm.locations = pm.locations.filter(locationFilter);
        return pm;
      });

      start = Date.now();
      return R.chain(makeMutants, parsedMatchesAfterFilter);
    })
    .then(sanityCheckAndSideEffects)
    // run the mutatnts and gather the results
    .then(function (ms: Mutant[]) {
      if (process.env.SKIP_RUN) {
        console.log("SKIP RUN:", ms.length)
        return [];
      }

      return mapSeriesP(handler, ms);
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
    // .finally(teardown)
}

function makeMutantHandler (runner: RunnerPlugin, reporter: ReporterPlugin) {
  return async function handler (mutant: Mutant): Promise<RunnerResult> {
    const result = await runMutant(runner, mutant);
    reporter.onResult && reporter.onResult(result);
    return result;
  }
}

async function runTest (cfg: PerturbConfig) {
  return await spawnP(cfg.testCmd);
}

// TODO -- what else? Any reason might want to serialize mutants here?
function sanityCheckAndSideEffects (ms: Mutant[]): Promise<Mutant[]> {
  ms.forEach(function (m: Mutant) {
    assert.notEqual(m.mutatedSourceCode, "", "Mutated source code should not be empty.");
  });
  return Promise.resolve(ms);
}

function spawnP (fullCommand: string): Promise<void> {
  return new Promise<void>(function (resolve, reject) {
    const [cmd, ...rest] = fullCommand.split(/\s+/);
    const child = spawn(cmd, rest);
    // child.stdout.pipe(process.stdout);
    // child.stderr.pipe(process.stderr);
    child.on("close", function (code) {
      code === 0 ? resolve() : reject(new Error(`Test command exited with non-zero code: ${code}`));
    });
  });
}

Promise.prototype.finally = function (cb) {
  return this.then(
    value => this.constructor.resolve(cb()).then(() => value),
    reason => this.constructor.resolve(cb()).then(() => { throw reason; })
  );
}

export = perturb;
