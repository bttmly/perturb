const debug = require("debug")("runner:mocha-child-process");
import fs = require("fs");
import cp = require("child_process");
import BaseRunner = require("./base");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

// TODO -- make configurable
const TIMEOUT = 10000;

class MochaChildRunner extends BaseRunner implements RunnerPlugin {
  name: string;

  constructor (m: Mutant) {
    super(m);
    this.name = "mocha-child";
  }

  setup () {
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.mutatedSourceCode);
    return Promise.resolve();
  }

  run () {
    const cmd = mochaExecutable();
    const args = ["-b", ...this._mutant.testFiles];
    const opts = { timeout: TIMEOUT };

    return new Promise(function (resolve, reject) {
      const child = cp.spawn(cmd, args, opts);
      child.stdout.on("data", d => debug(d.toString()));
      child.stderr.on("data", d => debug(d.toString()));
      child.on("error", err => {
        console.log("child error"); 
        reject(err);
      });

      child.on("exit", code => {
        if (code === 0) {
          console.log("child exit 0")
          return resolve();
        }

        console.log("child exit non zero");
        reject(new Error("Non-zero exit code from child process"));
      });
    })
    .then(() => Object.assign({}, this._mutant, { error: null }))
    .catch(err => Object.assign({}, this._mutant, { error: err }));
  }

  cleanup () {
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.originalSourceCode);
    return Promise.resolve();
  }

}

Object.defineProperty(MochaChildRunner, "name", {
  value: "mocha-child",
  enumerable: true,
});

function mochaExecutable () {
  return "mocha";
}

export = MochaChildRunner;
