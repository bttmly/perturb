import * as Mocha from "mocha";
import * as runnerUtils from "./utils";
import { RunnerPlugin, Mutant, RunnerResult } from "../types";

const plugin: RunnerPlugin = {
  name: "mocha",
  async setup(m: Mutant) {
    runnerUtils.clearRequireCache();
    runnerUtils.writeMutatedCode(m);
    const listeners = new Set(process.listeners("uncaughtException"));
    return { listeners };
  },

  async run(m: Mutant): Promise<RunnerResult> {
    try {
      await new Promise((resolve, reject) => {
        class Reporter {
          constructor(runner: Mocha.IRunner, options: any) {
            const r = runner as any;
            r.on("fail", (test: any, err: Error) => {
              reject(err);
            });
          }
        }

        const mocha = new Mocha({ reporter: Reporter, bail: true });
        m.testFiles.forEach(t => mocha.addFile(t));
        mocha.run(resolve);
      });
      return Object.assign({}, m, { error: null });
    } catch (error) {
      return Object.assign({}, m, { error });
    }
  },

  async cleanup(m: Mutant, b: any) {
    // edge case: multiple of same handler somehow attached. this will
    // only unbind one copy ... hmmm
    process
      .listeners("uncaughtException")
      .filter(f => b.listeners.has(f))
      .forEach(f => process.removeListener("uncaughtException", f));

    runnerUtils.restoreOriginalCode(m);
  },
};

export default plugin;
