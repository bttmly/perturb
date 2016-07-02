///<reference path="../typings/globals/node/index.d.ts"/>

const path = require("path");
const glob = require("glob");
const fs = require("fs-extra");
const R = require("ramda");

import { PerturbConfig } from "./types";

const shouldSymlink = new Set([
  "node_modules"
]);

function setupPerturbDirectory (config: PerturbConfig): void {

  const {projectRoot, sourceDir, testDir, perturbDir} = config;

  const sourceAbs = path.join(projectRoot, sourceDir);
  const testAbs = path.join(projectRoot, testDir);

  const pAbs = path.join(projectRoot, perturbDir);
  const pSourceAbs = path.join(pAbs, sourceDir);
  const pTestAbs = path.join(pAbs, testDir);

  console.log({ projectRoot, sourceAbs, testAbs, pAbs, pSourceAbs, pTestAbs })

  // maybe remove this? if it exists it means there is a bug with cleanup
  try {
    fs.removeSync(pAbs);
  } catch (e) {
    console.log("had to remove .perturb working directory... last run did not cleanup");
  }

  fs.mkdirSync(pAbs);
  fs.copySync(sourceAbs, pSourceAbs);
  fs.copySync(testAbs, pTestAbs);

  // fs.readdirSync(config.rootDir)
  //   .filter(f => shouldSymlink.has(f))
  //   .map(item => [path.join(config.rootDir, item), path.join(config.perturbRoot, item)])
  //   .forEach(R.apply(fs.symlinkSync))
}

function teardownPerturbDirectory (config): void {
  fs.removeSync(config.perturbRoot);
}

type FilePathResult = { sources: string[], tests: string[] };

interface FsHelper {
  setup(): void;
  teardown(): void;
  paths(): FilePathResult;
}

function getFilePaths (config): FilePathResult {
  return {
    sources: glob.sync(config.perturbSourceDir + config.sourceGlob),
    tests: glob.sync(config.perturbTestDir + config.testGlob),
  };
}

module.exports = function createFsHelpers (c: PerturbConfig) {
  return <FsHelper>{
    setup () {
      setupPerturbDirectory(c);
    },
    teardown () {
      teardownPerturbDirectory(c);
    },
    paths () {
      return getFilePaths(c);
    },
  };
}
