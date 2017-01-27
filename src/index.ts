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
import locateMutants = require("./locate-mutants");
import mutators = require("./mutators");
import parseMatch = require("./parse-match");

const mapSeriesP = R.curry(R.flip(Bluebird.mapSeries));

async function perturb (_cfg: PerturbConfig) {
  console.log(
    "*********************************************************\n",
    " -- THIS IS PRE-ALPHA SOFTWARE - USE AT YOUR OWN RISK -- \n",
    "*********************************************************\n"
  );

  const cfg = makeConfig(_cfg);

  console.log("init with config\n", cfg);

  const { setup, teardown, paths } = fileSystem(cfg);

  const matcher = getMatcher(cfg);
  const runner = getRunner(cfg.runner);
  const reporter = getReporter(cfg.reporter);
  const handler = makeMutantHandler(runner, reporter);
  const locator = locateMutants(mutators.getMutatorsForNode);

  // const testRun: Promise<void> = process.env.SKIP_TEST ? Promise.resolve() : runTest(cfg);

  // first run the tests, otherwise why bother at all?
  await spawnP(cfg.testCmd);

  try {
    // then, set up the "shadow" file system that we'll work against
    await setup();

    // read those "shadow" directories and find the source and test files
    const { sources, tests } = await paths();

    // use the matcher function to group {sourceFile, testFiles}
    // TODO -- this section has become a catch-all for various crap that
    // is actually orthogonal (tested/untested, start time, logging)
    const matches = matcher(sources, tests);

    const [ tested, untested ] = R.partition(hasTests, matches);

    // TODO -- surface untested file names somehow
    // console.log("untested files:", untested.map(m => m.source).join("\n"));
    if (tested.length === 0) {
      throw new Error("No matched files!");
    }

    if (untested.length) {
      console.log("*******************************************");
      console.log("UNTESTED FILES");
      untested.map(f => console.log(f.source));
      console.log("*******************************************");
    }

    // console.log("matches:", tested.map(t => ({source: t.source, tests: t.tests})));

    const parsedMatches = tested
    .map(parseMatch(locator))
    .map(pm => {
      pm.locations = pm.locations.filter(locationFilter);
      return pm;
    });

    const start = Date.now();

    // create the mutant objects from the matched files
    let mutants = await R.chain(makeMutants, parsedMatches);

    // let's just check if everything is okay...
    await sanityCheckAndSideEffects(mutants)

    if (process.env.SKIP_RUN) {
      console.log("SKIP RUN:", mutants.length)
      mutants = [];
    }

    // run the mutatnts and gather the results
    const results: RunnerResult[] = await mapSeriesP(handler, mutants);

    const duration = (Date.now() - start) / 1000;
    console.log("duration:", duration, "rate:", (results.length / duration), "/s");

    const metadata = { duration };

    if (reporter.onFinish) {
      reporter.onFinish(results, cfg, metadata);
    }

    // TODO -- provide some run metadata here:
    // duration: number
    // runner: string
    // sourceCount: number

    return results;

  } finally {
    await teardown();
  }
}

function makeMutantHandler (runner: RunnerPlugin, reporter: ReporterPlugin) {
  return async function handler (mutant: Mutant): Promise<RunnerResult> {
    const result = await runMutant(runner, mutant);
    reporter.onResult && reporter.onResult(result);
    return result;
  }
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

function hasTests (m: Match): boolean {
  return Boolean(R.path(["tests", "length"], m));
}

// TODO -- remove this, use Bluebird or something
Promise.prototype.finally = function (cb) {
  return this.then(
    value => this.constructor.resolve(cb()).then(() => value),
    reason => this.constructor.resolve(cb()).then(() => { throw reason; })
  );
}

export = perturb;
