import * as R from "ramda";
import { spawn } from "child_process";
import * as assert from "assert";

import getRunner from "./runners";
import getReporter from "./reporters";
import getMatcher from "./matchers";
import locationFilter from "./filters";
import makeMutants from "./make-mutants";
import makeConfig from "./make-config";
import locateMutants from "./locate-mutants";
import * as mutators from "./mutators";
import parseMatch from "./parse-match";
import fileSystem from "./file-system";

import {
  OptionalPerturbConfig,
  RunnerResult,
  Mutant,
  ReporterPlugin,
  Match,
  RunnerPluginConstructor,
  PerturbConfig,
} from "./types";

export default async function perturb(inputCfg: OptionalPerturbConfig) {
  console.log(
    "*********************************************************\n",
    " -- THIS IS PRE-ALPHA SOFTWARE - USE AT YOUR OWN RISK -- \n",
    "*********************************************************\n",
  );

  const config = makeConfig(inputCfg);

  console.log("init with config\n", config);

  const { setup, teardown, paths } = fileSystem(config);

  const matcher = getMatcher(config);
  const runner = getRunner(config.runner);
  const reporter = getReporter(config.reporter);
  const handler = makeMutantHandler(runner, reporter);
  const locator = locateMutants(mutators.getMutatorsForNode);

  // const testRun: Promise<void> = process.env.SKIP_TEST ? Promise.resolve() : runTest(config);

  // first run the tests, otherwise why bother at all?
  await runProjectTests(config);

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

    // let diff = 0;

    const parsedMatches = tested.map(parseMatch(locator)).map(pm => {
      const remaining = pm.locations.filter(locationFilter);
      // diff += pm.locations.length - remaining.length;
      pm.locations = remaining;
      return pm;
    });

    // console.log(`NODE FILTERS REMOVED ${diff} LOCATIONS`)

    const start = Date.now();

    // create the mutant objects from the matched files
    let mutants = parsedMatches.flatMap(makeMutants);

    // let's just check if everything is okay...
    await sanityCheckAndSideEffects(mutants);

    if (process.env.SKIP_RUN) {
      console.log("SKIP RUN:", mutants.length);
      mutants = [];
    }

    // run the mutants and gather the results
    const results: RunnerResult[] = [];
    for (const mutant of mutants) {
      results.push(await handler(mutant));
    }

    const duration = (Date.now() - start) / 1000;
    console.log(
      "duration:",
      duration,
      "rate:",
      (results.length / duration).toFixed(2),
      "/s",
    );

    const metadata = { duration };

    if (reporter.onFinish) {
      reporter.onFinish(results, config, metadata);
    }

    // TODO -- provide some run metadata here:
    // duration: number
    // runner: string
    // sourceCount: number

    return { results, config };
  } finally {
    await teardown();
  }
}

function makeMutantHandler(
  Runner: RunnerPluginConstructor,
  reporter: ReporterPlugin,
) {
  return async function handler(mutant: Mutant): Promise<RunnerResult> {
    const runner = new Runner(mutant);
    await runner.setup();
    const result = await runner.run();
    await runner.cleanup();
    try {
      reporter.onResult(result);
    } catch (err) {
      throw err;
    }
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

async function runProjectTests(config: PerturbConfig): Promise<void> {
  const dir = process.cwd();
  process.chdir(config.projectRoot);
  try {
    await new Promise<void>((resolve, reject) => {
      const [cmd, ...rest] = config.testCmd.split(/\s+/);
      console.log("DOING A TEST:", process.cwd(), cmd, rest);
      const child = spawn(cmd, rest);
      // TODO: print errors from child process
      // child.stderr.pipe(process.stderr);
      const out: Buffer[] = [];
      child.stdout.on("data", buf => {
        if (typeof buf === "string") buf = Buffer.from(buf);
        out.push(buf);
      });
      child.on("close", code => {
        if (code === 0) return resolve();
        console.error(Buffer.concat(out).toString());
        reject(new Error(`Test command exited with non-zero code: ${code}`));
      });
    });
  } finally {
    process.chdir(dir);
  }
}

function hasTests(m: Match): boolean {
  return Boolean(R.path(["tests", "length"], m));
}
