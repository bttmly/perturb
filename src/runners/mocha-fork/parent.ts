const debug = require("debug")("runner:mocha-fork");
import fs = require("fs");
import cp = require("child_process");
import BaseRunner = require("../base");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../../types";

// TODO -- make configurable
const TIMEOUT = 10000;

// TODO -- use child_process.fork() here. This file needs to acommodate both
// the parent and child, and handle passing messages between them, so we can
// surface errors in the runner besides just "child exited with non-zero code"
// 

class MochaChildRunner extends BaseRunner implements RunnerPlugin {
  name: string;

  constructor (m: Mutant) {
    super(m);
    this.name = "mocha-fork";
  }

  setup () {
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.mutatedSourceCode);
    return Promise.resolve();
  }

  run () {
    const args = [ JSON.stringify(this._mutant) ];
    const opts = { timeout: TIMEOUT, env: { PERTURB_MOCHA_FORK_CHILD: "yes" } };
    const child = cp.fork(__dirname, args);

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
    // so it will type 
    .then(() => Object.assign({}, this._mutant, { error: null }))
    .catch(err => Object.assign({}, this._mutant, { error: err }));
  }

  cleanup () {
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.originalSourceCode);
    return Promise.resolve();
  }

}

Object.defineProperty(MochaChildRunner, "name", {
  value: "mocha-fork",
  enumerable: true,
});

function mochaExecutable () {
  return "mocha";
}

export = MochaChildRunner;
