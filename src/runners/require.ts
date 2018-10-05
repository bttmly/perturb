import * as runnerUtils from "./utils";
import { RunnerPlugin, Mutant } from "../types";

export default class RequireRunner implements RunnerPlugin {
  public type: "runner";
  public name: string;
  private _mutant: Mutant;

  constructor(m: Mutant) {
    this.type = "runner";
    this.name = "require";
    this._mutant = m;
  }

  async setup() {
    runnerUtils.clearRequireCache();
    runnerUtils.writeMutatedCode(this._mutant);
  }

  async run() {
    try {
      this._mutant.testFiles.forEach(f => require(f));
    } catch (error) {
      console.log(error.message);
      return Object.assign({}, this._mutant, { error });
    }
    return Object.assign({}, this._mutant, { error: null });
  }

  async cleanup() {
    runnerUtils.restoreOriginalCode(this._mutant);
  }
}
