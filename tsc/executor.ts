import * as R from "ramda";
import * as Bluebird from "bluebird";

import getRunner from "./runners";
import getReporter from "./reporters";

import {
  RunnerPlugin,
  ReporterPlugin,
  Mutant,
  MutationResult,
  PerturbConfig,
} from "./types";

class Executor {
  _runner: RunnerPlugin;
  _reporter: ReporterPlugin;

  constructor(cfg: PerturbConfig) {
    this._runner = getRunner(cfg.runner);
    this._reporter = getReporter(cfg.reporter);
  }

  execute(ms: Mutant[]) {
    return Bluebird.mapSeries(ms, m => {
      this._run(m).then(r => {
        this._reporter.onResult(r);
        return r;
     }).then(rs => this._reporter.onFinish(rs));
  }

  _run(m: Mutant) {
    let _before, _result;
    return this._runner.prepare(m)
      .then(before => {
        _before = before;
        return this._runner.run(m)
      })
      .then(result => {
        _result = result;
        this._runner.cleanup(result, _before);
      })
      .then(() => _result);
  }
}
