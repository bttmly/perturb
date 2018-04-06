import * as path from "path";
import * as fs from "fs-extra";
import { PerturbConfig } from "./types";

const glob = require("glob");

const shouldSymlink = new Set(["node_modules"]);

// hack...
// remove this if at all possible
// otherwise, make configurable
// const shouldSkip = new Set([".perturb"]);

function setupPerturbDirectory(config: PerturbConfig) {
  const { projectRoot, perturbDir } = config;

  // const sourceAbs = path.join(projectRoot, sourceDir);
  // const testAbs = path.join(projectRoot, testDir);

  const pAbs = path.join(projectRoot, perturbDir);
  // const pSourceAbs = path.join(pAbs, sourceDir);
  // const pTestAbs = path.join(pAbs, testDir);

  // console.log({ projectRoot, sourceAbs, testAbs, pAbs, pSourceAbs, pTestAbs });

  // maybe remove this? if it exists it means there is a bug with cleanup
  try {
    fs.removeSync(pAbs);
  } catch (e) {
    console.log(
      "had to remove .perturb working directory... last run did not cleanup",
    );
  }

  fs.mkdirSync(pAbs);

  const dirContents = fs.readdirSync(projectRoot);

  dirContents
    .filter(f => f !== config.perturbDir)
    .filter(f => !shouldSymlink.has(f))
    .map(f => [path.join(projectRoot, f), path.join(pAbs, f)])
    .forEach(([src, dest]) => fs.copySync(src, dest));

  dirContents
    .filter(f => f !== config.perturbDir)
    .filter(f => shouldSymlink.has(f))
    .map(f => [path.join(projectRoot, f), path.join(pAbs, f)])
    .forEach(([src, dest]) => fs.symlinkSync(src, dest));
}

function teardownPerturbDirectory(config: PerturbConfig) {
  const { projectRoot, perturbDir } = config;
  const pAbs = path.join(projectRoot, perturbDir);
  fs.removeSync(pAbs);
}

function getFilePaths(config: PerturbConfig) {
  const { projectRoot, sourceDir, testDir, perturbDir } = config;
  const pAbs = path.join(projectRoot, perturbDir);
  const pSourceAbs = path.join(pAbs, sourceDir);
  const pTestAbs = path.join(pAbs, testDir);

  const sources: string[] = glob.sync(pSourceAbs + config.sourceGlob);
  const tests: string[] = glob.sync(pTestAbs + config.testGlob);
  return { sources, tests };
}

export default function createFsHelpers(c: PerturbConfig) {
  return {
    setup: () => setupPerturbDirectory(c),
    teardown: () => teardownPerturbDirectory(c),
    paths: () => getFilePaths(c),
  };
}
