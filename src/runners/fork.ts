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
      // silent: false,
      env: {
        // TODO -- configurable!
        PERTURB_FORK_RUNNER: "require",
        DEBUG: process.env.DEBUG,
      },
    };
    
    // can't pass the serialzed mutant as a command line argument,
    // it's wayyy too big, so write it to disk and the child will
    // pick it up from there
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
  debug("getting mutator", name);
 
  const mutant: Mutant = require(process.argv[2])
  const runner: RunnerPlugin = require("./")(name);
  try {
    const result = await runMutant(runner, mutant);
    sendError(result.error);
  } catch (e) {
    sendError(e);
  }
  return null;
}

if (process.env.PERTURB_FORK_RUNNER) {
  childRunner(process.env.PERTURB_FORK_RUNNER);
}

function sendError (err) {
  const message = err == null ?
    {} : { error: runnerUtils.makeErrorSerializable(err) }

  if (process.send == null) {
    throw new Error("Tried to call process.send() not in child!");
  }

  process.send(JSON.stringify(message));
}

function tempFileLocation () {
  const id = Math.random().toString(16).slice(2);
  return path.join(os.tmpdir(), `perturb-fork-mutant-${id}.json`); 
}

Promise.prototype.finally = function (cb) {
  return this.then(
    value => this.constructor.resolve(cb()).then(() => value),
    reason => this.constructor.resolve(cb()).then(() => { throw reason; })
  );
}