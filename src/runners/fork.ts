import * as _debug from "debug";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { fork } from "child_process";
import { RunnerPlugin, Mutant, RunnerResult, RunnerPluginConstructor } from "../types";
import * as runnerUtils from "./utils";

const debug = _debug("runner:fork");

// TODO -- make configurable
const TIMEOUT = 10000;

export default class ForkRunner implements RunnerPlugin {
  name: string;
  private _fileLocation: string;
  private _mutant: Mutant;

  constructor(m: Mutant) {
    this.name = "fork";
    this._mutant = m;
    this._fileLocation = tempFileLocation();
  }

  async setup(): Promise<void> {}

  async run(): Promise<RunnerResult> {
    if (this._fileLocation == null) {
      throw new Error("Setup did not run!");
    }

    const args = [this._fileLocation];
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
    fs.writeFileSync(this._fileLocation, JSON.stringify(this._mutant));

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
      return Object.assign({}, this._mutant);
    } catch (error) {
      return Object.assign({}, this._mutant, { error });
    } finally {
      clearTimeout(timeout);
    }
  }

  async cleanup() {
    fs.unlinkSync(this._fileLocation);
  }
}

async function childRunner(name: string) {
  debug("looking for mutant json file at", process.argv[2], "...");
  debug("getting mutator", name, typeof require);
  const mutant: Mutant = require(process.argv[2]);
  const Runner: RunnerPluginConstructor = require("./").default(name);
  const runner = new Runner(mutant);
  await runner.setup();
  const result = await runner.run();
  await runner.cleanup();
  sendError(result.error);
  return null;
}

if (process.env.PERTURB_FORK_RUNNER) {
  process.on("unhandledRejection", err => { throw err; });
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
