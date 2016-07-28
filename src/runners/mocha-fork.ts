const debug = require("debug")("runner:mocha-fork");
import fs = require("fs");
import cp = require("child_process");

import runnerUtils = require("./utils");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult,
} from "../types";

// TODO -- make configurable
const TIMEOUT = 10000;

export = <RunnerPlugin>{
  name: "mocha-fork",
  setup () { return Promise.resolve(); },
  run (m: Mutant) {
    const args = [ JSON.stringify(m) ];
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
    .then(() => Object.assign({}, m, { error: null }))
    .catch(err => Object.assign({}, m, { error: err }));
  },
  cleanup () { return Promise.resolve(); }
}

async function childRunner () {
  const mutant: Mutant = JSON.parse(process.argv[2]);
  const runner: RunnerPlugin = require("./mocha");

  const before = await runner.setup(mutant);
  const result: RunnerResult = await runner.run(mutant);
  await runner.cleanup(mutant, before);
  process.send(JSON.stringify({
    error: runnerUtils.makeErrorSerializable(result.error)
  }));
  return null;
}

if (process.env.PERTURB_MOCHA_FORK_CHILD) {
  childRunner();
}

