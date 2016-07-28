///<reference path="./mocha.d.ts"/>

import R = require("ramda");
import Mocha = require("mocha");
import BaseRunner = require("./base");
import runnerUtils = require("./utils");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

class MochaRunner implements RunnerPlugin {
  name: string;
  _listeners: Set<Function>;
  _mutant: Mutant;

  constructor (m: Mutant) {
    this._mutant = m;
    this.name = "mocha";
  }

  setup (): Promise<void> {
    runnerUtils.clearRequireCache()
    runnerUtils.writeMutatedCode(this._mutant)
    this._listeners = new Set(process.listeners("uncaughtException"));
    return Promise.resolve();
  }

  run (): Promise<RunnerResult> {
    const mutant = this._mutant;
    return new Promise(function (resolve, reject) {
      
      function reporter (mochaRunner) {
        mochaRunner.on("fail", function (test, err) {
          reject(err);
        });
      }

      const mocha = new Mocha({ reporter, bail: true });
      mutant.testFiles.forEach(t => mocha.addFile(t));
      mocha.run(resolve);
    })
    .then(() => Object.assign({}, mutant, { error: null }))
    .catch(error => Object.assign({}, mutant, { error }));
  }

  cleanup (): Promise<void> {
    // edge case: multiple of same handler somehow attached. this will
    // only unbind one copy ... hmmm
    process.listeners("uncaughtException")
      .filter(f => !this._listeners.has(f))
      .forEach(f => process.removeListener("uncaughtException", f));
      
    runnerUtils.restoreOriginalCode(this._mutant);
    return Promise.resolve();
  }
}

Object.defineProperty(MochaRunner, "name", {
  value: "mocha",
  enumerable: true,
});

export = MochaRunner;
