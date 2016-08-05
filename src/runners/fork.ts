const debug = require("debug")("runner:fork");
import fs = require("fs");
import path = require("path");
import os = require("os");
import cp = require("child_process");

import runMutant = require("../util/run-mutant");
import runnerUtils = require("./utils");

// TODO -- make configurable
const TIMEOUT = 10000;

export = <RunnerPlugin>{
  name: "fork",
  setup () { return Promise.resolve(); },
  run (m: Mutant) {
    // debug("starting", m.mutatorName);

    const fileLocation = tempFileLocation();
    const args = [ fileLocation ];
    const opts = {
      silent: true,
      env: { PERTURB_FORK_RUNNER: "require" },
    };
    
    // using a temp file otherwise often hit E2BIG trying to pass
    // in an entire mutant object as a command line argument
    fs.writeFileSync(fileLocation, JSON.stringify(m));

    const child = cp.fork(__filename, args, opts);

    const timeout = setTimeout(() => {
      debug("timeout exceeded, terminating runner");
      child.kill("SIGTERM");
    }, TIMEOUT);

    return new Promise(function (resolve, reject) {
      child.on("error", function (err) {
        debug("child error", err.stack);
        reject(err);
      });

      child.on("exit", function (code) {
        debug("child exit", code);

        // note: code is `null` when child terminated by timeout
        code === 0 ?
          resolve() :
          reject(new Error("Non-zero exit code from child process"));
      });

      child.on("message", function (msg) {
        const data = JSON.parse(msg);
        data.error ? reject(data.error) : resolve();
      });
    })
    .finally(() => clearTimeout(timeout))
    .then(() => Object.assign({}, m))
    .catch(err => Object.assign({}, m, { error: err }))
  },
  cleanup () { return Promise.resolve(); }
}

async function childRunner (name) {
  debug("looking for mutant json file at", process.argv[2], "...");

  const mutant: Mutant = require(process.argv[2])
  const runner: RunnerPlugin = require("./")(name);
  const result = await runMutant(runner, mutant);

  const message = result.error == null ?
    {} : { error: runnerUtils.makeErrorSerializable(result.error) }

  if (process.send != null) {
    process.send(JSON.stringify(message));  
  }
  
  return null;
}

if (process.env.PERTURB_FORK_RUNNER) {
  childRunner(process.env.PERTURB_FORK_RUNNER);
}

function tempFileLocation () {
  return path.join(os.tmpdir(), "perturb-fork-mutant.json"); 
}