///<reference path="./mocha.d.ts"/>

import R = require("ramda");
import Mocha = require("mocha");
import BaseRunner = require("./base");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

class MochaRunner extends BaseRunner implements RunnerPlugin {
  _listeners: Set<Function>
  name: string;

  constructor (m: Mutant) {
    super(m);
    this.name = "mocha";
  }

  setup (): Promise<void> {
    this._listeners = new Set(process.listeners("uncaughtException"));
    return this._baseSetup();
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

      // try {
      //   mocha.run(() => {
      //     if (err == null) {
      //       console.log("finished with no error");
      //     }
      //     resolve()
      //   });
      // } catch (e) {
      //   console.log("error during require");
      //   throw e
      // }

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
    return this._baseCleanup();
  }
}

Object.defineProperty(MochaRunner, "name", {
  value: "mocha",
  enumerable: true,
});

export = MochaRunner;
