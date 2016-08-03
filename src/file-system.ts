import path = require("path");
import fs = require("fs-extra");
import R = require("ramda");

const glob = require("glob");

const shouldSymlink = new Set([
  "node_modules"
]);

// hack...
// remove this if at all possible
// otherwise, make configurable
const shouldSkip = new Set([
  ".perturb"
]);

function setupPerturbDirectory (config: PerturbConfig): void {

  const {projectRoot, sourceDir, testDir, perturbDir} = config;

  const sourceAbs = path.join(projectRoot, sourceDir);
  const testAbs = path.join(projectRoot, testDir);

  const pAbs = path.join(projectRoot, perturbDir);
  const pSourceAbs = path.join(pAbs, sourceDir);
  const pTestAbs = path.join(pAbs, testDir);

  // console.log({ projectRoot, sourceAbs, testAbs, pAbs, pSourceAbs, pTestAbs });

  // maybe remove this? if it exists it means there is a bug with cleanup
  try {
    fs.removeSync(pAbs);
  } catch (e) {
    console.log("had to remove .perturb working directory... last run did not cleanup");
  }

  fs.mkdirSync(pAbs);
  // fs.copySync(sourceAbs, pSourceAbs);
  // fs.copySync(testAbs, pTestAbs);

  fs.readdirSync(projectRoot)
    .filter(f => f !== config.perturbDir)
    .filter(f => !shouldSymlink.has(f))
    .map(f => [path.join(projectRoot, f), path.join(pAbs, f)])
    .forEach(function ([src, dest]) {
      fs.copySync(src, dest);
    });

  fs.readdirSync(projectRoot)
    .filter(f => f !== config.perturbDir)
    .filter(f => shouldSymlink.has(f))
    .map(f => [path.join(projectRoot, f), path.join(pAbs, f)])
    .forEach(R.apply(fs.symlinkSync))
}

function teardownPerturbDirectory (config): void {
  const {projectRoot, sourceDir, testDir, perturbDir} = config;
  const pAbs = path.join(projectRoot, perturbDir);
  fs.removeSync(pAbs);
}

type FilePathResult = { sources: string[], tests: string[] };

interface FsHelper {
  setup(): void;
  teardown(): void;
  paths(): FilePathResult;
}

function getFilePaths (config: PerturbConfig): FilePathResult {
  const {projectRoot, sourceDir, testDir, perturbDir} = config;
  const pAbs = path.join(projectRoot, perturbDir);
  const pSourceAbs = path.join(pAbs, sourceDir);
  const pTestAbs = path.join(pAbs, testDir);

  return {
    sources: glob.sync(pSourceAbs + config.sourceGlob),
    tests: glob.sync(pTestAbs + config.testGlob),
  };
}

function createFsHelpers (c: PerturbConfig) {
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

export = createFsHelpers;
