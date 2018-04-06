const debug = require("debug")("runner:fork");
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { fork } from "child_process";
import { RunnerPlugin, Mutant } from "../types";

import runMutant from "../util/run-mutant";
import runnerUtils = require("./utils");

// TODO -- make configurable
const TIMEOUT = 10000;

const plugin: RunnerPlugin = {
  name: "fork",
  async setup() {
    return { fileLocation: tempFileLocation() };
  },
  async run(m: Mutant, { fileLocation }) {
    // debug("starting", m.mutatorName);
    const args = [fileLocation];
    const opts = {
      silent: true,
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

    const child = fork(__filename, args, opts);

    const timeout = setTimeout(() => {
      debug("timeout exceeded, terminating runner");
      child.kill("SIGTERM");
    }, TIMEOUT);

    try {
      await new Promise((resolve, reject) => {
        child.on("error", err => {
          debug("child error", err.stack);
          reject(err);
        });

        child.on("exit", code => {
          debug(`child exit: ${code}`);

          // note: code is `null` when child terminated by timeout
          code === 0
            ? resolve()
            : reject(new Error("Non-zero exit code from child process"));
        });

        child.on("message", msg => {
          const data = JSON.parse(msg);
          data.error ? reject(data.error) : resolve();
        });
      });
      return Object.assign({}, m);
    } catch (error) {
      return Object.assign({}, m, { error });
    } finally {
      clearTimeout(timeout);
    }
  },
  async cleanup(m: Mutant, { fileLocation }) {
    fs.unlinkSync(fileLocation);
  },
};

async function childRunner(name: string) {
  debug("looking for mutant json file at", process.argv[2], "...");
  debug("getting mutator", name, typeof require);
  const mutant: Mutant = require(process.argv[2]);
  const runner: RunnerPlugin = require("./").default(name);
  const result = await runMutant(runner, mutant);
  sendError(result.error);
  return null;
}

export default plugin;

if (process.env.PERTURB_FORK_RUNNER) {
  process.on("unhandledRejection", err => {
    throw err;
  });
  childRunner(process.env.PERTURB_FORK_RUNNER);
}

function sendError(err: Error) {
  const message =
    err == null ? {} : { error: runnerUtils.makeErrorSerializable(err) };

  if (process.send == null) {
    throw new Error("Tried to call process.send() not in child!");
  }

  process.send(JSON.stringify(message));
}

function tempFileLocation() {
  const id = Math.random()
    .toString(16)
    .slice(2);
  return path.join(os.tmpdir(), `perturb-fork-mutant-${id}.json`);
}
