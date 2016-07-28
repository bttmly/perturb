///<reference path="./mocha.d.ts"/>

import R = require("ramda");
import Mocha = require("mocha");
import runnerUtils = require("./utils");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

export = <RunnerPlugin>{
  name: "mocha",
  setup (m: Mutant) {
    runnerUtils.clearRequireCache()
    runnerUtils.writeMutatedCode(m)
    const listeners = new Set(process.listeners("uncaughtException"));
    return Promise.resolve({ listeners });
  },

  run (m: Mutant): Promise<RunnerResult> {
    return new Promise(function (resolve, reject) {
      
      function reporter (mochaRunner) {
        mochaRunner.on("fail", function (test, err) {
          reject(err);
        });
      }

      const mocha = new Mocha({ reporter, bail: true });
      m.testFiles.forEach(t => mocha.addFile(t));
      mocha.run(resolve);
    })
    .then(() => Object.assign({}, m, { error: null }))
    .catch(error => Object.assign({}, m, { error }));
  },

  cleanup (m: Mutant, b: any) {
    // edge case: multiple of same handler somehow attached. this will
    // only unbind one copy ... hmmm
    process.listeners("uncaughtException")
      .filter(f => b.listeners.has(f))
      .forEach(f => process.removeListener("uncaughtException", f));
      
    runnerUtils.restoreOriginalCode(m);
    return Promise.resolve();
  }
}

