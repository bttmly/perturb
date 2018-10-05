import * as Mocha from "mocha";
import * as runnerUtils from "./utils";
import { RunnerPlugin, Mutant, RunnerResult } from "../types";

export default class MochaRunner implements RunnerPlugin {
  public type: "runner";
  public name: string;
  private _mutant: Mutant;
  private _listeners: any[];

  constructor(m: Mutant) {
    this.type = "runner";
    this.name = "mocha";
    this._mutant = m;
    this._listeners = [];
  }

  async setup(): Promise<void> {
    runnerUtils.clearRequireCache();
    runnerUtils.writeMutatedCode(this._mutant);
    this._listeners = process.listeners("uncaughtException");
  }

  async run(): Promise<RunnerResult> {
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
        this._mutant.testFiles.forEach(t => mocha.addFile(t));
        mocha.run(resolve);
      });
      return Object.assign({}, this._mutant, { error: null });
    } catch (error) {
      return Object.assign({}, this._mutant, { error });
    }
  }

  async cleanup(): Promise<void> {
    process
      .listeners("uncaughtException")
      .filter(f => !this._listeners.includes(f))
      .forEach(f => process.removeListener("uncaughtException", f));

    runnerUtils.restoreOriginalCode(this._mutant);
  }
}
