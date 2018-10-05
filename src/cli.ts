#!/usr/bin/env node

import * as path from "path";
import * as program from "commander";
import * as fs from "fs";
import * as R from "ramda";

import perturb from "./";
import { OptionalPerturbConfig } from "./types";

interface PackageJSON {
  version: string;
}

const pkg: PackageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"));

program
  .version(pkg.version)
  .option("-r, --rootDir <rootDir>", "root directory of the project")
  .option("-t, --testDir <testDir>", "test directory relative to root directory")
  .option("-s, --sourceDir <sourceDir>", "source directory relative to root directory")
  .option("-x, --testGlob <testGlob>", "glob for selecting files in test directory")
  .option("-y, --sourceGlob <sourceGlob>", "glob for selecting files in source directory")
  .option("-c, --testCmd <testCmd>", "test command")
  .option("-k, --killRateMin <i>", "minimum kill rate to exit with code 0", parseInt)
  .option("-u, --runner <runner>", "name of runner or runner plugin")
  .parse(process.argv);

if (program.rootDir && program.rootDir[0] !== "/") {
  program.rootDir = path.join(process.cwd(), program.rootDir);
}

// we need to remove the undefined/null properties entirely, because of the way Object.assign works which
// is the mechanism by which config is combined later.
const args: OptionalPerturbConfig = R.pickBy(R.complement(R.isNil), {
  rootDir: program.rootDir,
  testDir: program.testDir,
  sourceDir: program.sourceDir,
  testGlob: program.testGlob,
  sourceGlob: program.sourceGlob,
  testCmd: program.testCmd,
  runner: program.runner,
  killRateMin: program.killRateMin,
});

// sync errors inside perturb don't seem to properly cause a non-zero exit w/o this
process.on("uncaughtException", (err) => {
  console.log("uncaught error in perturb process", err);
  throw err;
});

// sync errors inside perturb don't seem to properly cause a non-zero exit w/o this
process.on("unhandledRejection", (err) => {
  throw err;
});

// start!
(async function main() {
  const { results, config } = await perturb(args);
  console.log("DONE -- COUNT:", results.length);

  const killed = results.filter(r => r.error);
  const killRate = Number((killed.length / results.length).toFixed(4)) * 100;

  if (killRate < config.killRateMin) {
    console.error(`❌ Mutant kill rate was ${killRate} which is below minimum acceptable value ${config.killRateMin}`)
    process.exitCode = 1;
  } else {
    console.log(`✅ Mutant kill rate was ${killRate} which is above minimum acceptable value ${config.killRateMin}`)
  }
})();