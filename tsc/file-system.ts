"use strict";

///<reference path="../typings/globals/node/index.d.ts"/>
///<reference path="../typings/globals/fs-extra/index.d.ts"/>
///<reference path="../typings/modules/ramda/index.d.ts"/>

const join = require("path").join;
const glob = require("glob");
const fs = require("fs-extra");
const R = require("ramda");

import {PerturbConfig} = "./types";

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
    .map(item => [join(config.rootDir, item), join(config.perturbRoot, item)])
    .forEach(R.apply(fs.symlinkSync))
}

function teardownPerturbDirectory (config): void {
  fs.removeSync(config.perturbRoot);
}

type filePathResult = { sources: string[], tests: string[] }
function getFilePaths (config): filePathResult {
  return {
    sources: glob.sync(config.perturbSourceDir + config.sourceGlob),
    tests: glob.sync(config.perturbTestDir + config.testGlob),
  };
}

module.exports = function createFsHelpers (c: PerturbConfig) {
  return {
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
