import * as R from "ramda";
import * as Bluebird from "bluebird";
import { spawn } from "child_process";
import * as assert from "assert";

import getRunner from "./runners";
import getReporter from "./reporters";
import getMatcher from "./matchers";
import locationFilter from "./filters";
import makeMutants from "./make-mutants";
import makeConfig from "./make-config";
import runMutant from "./util/run-mutant";
import locateMutants from "./locate-mutants";
import * as mutators from "./mutators";
import parseMatch from "./parse-match";
import fileSystem from "./file-system";

import {
  PerturbConfig,
  RunnerPlugin,
  RunnerResult,
  Mutant,
  ReporterPlugin,
  Match,
} from "./types";

async function perturb(_cfg: PerturbConfig) {
  console.log(
    "*********************************************************\n",
    " -- THIS IS PRE-ALPHA SOFTWARE - USE AT YOUR OWN RISK -- \n",
    "*********************************************************\n",
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

    const [tested, untested] = R.partition(hasTests, matches);

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

    const parsedMatches = tested.map(parseMatch(locator)).map(pm => {
      pm.locations = pm.locations.filter(locationFilter);
      return pm;
    });

    const start = Date.now();

    // create the mutant objects from the matched files
    let mutants = await R.chain(makeMutants, parsedMatches);

    // let's just check if everything is okay...
    await sanityCheckAndSideEffects(mutants);

    if (process.env.SKIP_RUN) {
      console.log("SKIP RUN:", mutants.length);
      mutants = [];
    }

    // run the mutatnts and gather the results
    const results: RunnerResult[] = await Bluebird.mapSeries(mutants, handler);

    const duration = (Date.now() - start) / 1000;
    console.log(
      "duration:",
      duration,
      "rate:",
      results.length / duration,
      "/s",
    );

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

function makeMutantHandler(runner: RunnerPlugin, reporter: ReporterPlugin) {
  return async function handler(mutant: Mutant): Promise<RunnerResult> {
    const result = await runMutant(runner, mutant);
    if (reporter.onResult) reporter.onResult(result);
    return result;
  };
}

// TODO -- what else? Any reason might want to serialize mutants here?
async function sanityCheckAndSideEffects(ms: Mutant[]): Promise<Mutant[]> {
  ms.forEach((m: Mutant) => {
    assert.notEqual(
      m.mutatedSourceCode,
      "",
      "Mutated source code should not be empty.",
    );
    assert.notEqual(
      m.originalSourceCode,
      m.mutatedSourceCode,
      "Mutated source code should be different from original.",
    );
  });
  return ms;
}

function spawnP(fullCommand: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const [cmd, ...rest] = fullCommand.split(/\s+/);
    const child = spawn(cmd, rest);
    // child.stdout.pipe(process.stdout);
    // child.stderr.pipe(process.stderr);
    child.on("close", code => {
      code === 0
        ? resolve()
        : reject(new Error(`Test command exited with non-zero code: ${code}`));
    });
  });
}

function hasTests(m: Match): boolean {
  return Boolean(R.path(["tests", "length"], m));
}

export = perturb;
