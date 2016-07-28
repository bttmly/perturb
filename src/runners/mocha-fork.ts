const debug = require("debug")("runner:mocha-fork");
import fs = require("fs");
import cp = require("child_process");

import runnerUtils = require("./utils");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult,
  RunnerPluginCtor,
} from "../types";

// TODO -- make configurable
const TIMEOUT = 10000;

class MochaForkRunner implements RunnerPlugin {
  name: string;
  _mutant: Mutant;
  
  constructor (m: Mutant) {
    this._mutant = m;
    this.name = "mocha-fork";
  }

  // child runner handles set up
  setup () { return Promise.resolve() }

  run () {
    const args = [ JSON.stringify(this._mutant) ];
    const opts = { timeout: TIMEOUT, env: { PERTURB_MOCHA_FORK_CHILD: true } };
    const child = cp.fork(__filename, args, opts);

    return new Promise(function (resolve, reject) {
      child.on("error", function (err) {
        debug("child error", err.stack);
        reject(err);
      });

      child.on("exit", function (code) {
        debug("child exit", code);

        code === 0 ?
          resolve() :
          reject(new Error("Non-zero exit code from child process"));
      });

      child.on("message", function (msg) {
        const data = JSON.parse(msg);
        data.error ? reject(data.error) : resolve();
      });
    })
    .then(() => Object.assign({}, this._mutant, { error: null }))
    .catch(err => Object.assign({}, this._mutant, { error: err }));
  }

  // the child runner handles cleanup
  cleanup () { return Promise.resolve() }

  // 
  static childRunner () {
    const mutant: Mutant = JSON.parse(process.argv[2]);
    const MochaRunner: RunnerPluginCtor = require("./mocha");
    const runner: RunnerPlugin = new MochaRunner(mutant);
    let result: RunnerResult;
    Promise.resolve()
      .then(() => runner.setup())
      .then(() => runner.run())
      .then(_result => result = _result)
      .then(() => runner.cleanup())
      .then(function () {
        process.send(JSON.stringify({
          error: runnerUtils.makeErrorSerializable(result.error)
        }));
      });
  }
}

Object.defineProperty(MochaForkRunner, "name", {
  value: "mocha-fork",
  enumerable: true,
});

if (process.env.PERTURB_MOCHA_FORK_CHILD) {
  MochaForkRunner.childRunner();
}

export = MochaForkRunner;
