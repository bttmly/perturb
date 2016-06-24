const path = require("path");
const glob = require("glob");
const fs = require("fs-extra");
const R = require("ramda");

import { PerturbConfig } from "./types";

const shouldSymlink = new Set([
  "node_modules"
]);

function setupPerturbDirectory (config): void {

  // maybe remove this? if it exists it means there is a bug with cleanup
  fs.removeSync(config.perturbRoot);
  fs.mkdirSync(config.perturbRoot);
  fs.copySync(config.originalSourceDir, config.perturbSourceDir);
  fs.copySync(config.originalTestDir, config.perturbTestDir);

  fs.readdirSync(config.rootDir)
    .filter(f => shouldSymlink.has(f))
    .map(item => [path.join(config.rootDir, item), path.join(config.perturbRoot, item)])
    .forEach(R.apply(fs.symlinkSync))
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
