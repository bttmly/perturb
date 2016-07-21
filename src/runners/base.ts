const fs = require("fs");

import { Mutant, RunnerResult } from "../types";

class BaseRunner {

  _mutant: Mutant;
  _cache: Set<string>

  constructor (m: Mutant) {
    this._mutant = m;
    this._cache = new Set();
  }

  run () {
    throw new Error("Must be implemented in subclass!");
  }

  _baseSetup (): Promise<void> {
    delete require.cache[this._mutant.sourceFile];
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.mutatedSourceCode);
    this._cache = new Set(Object.keys(require.cache));
    return Promise.resolve();
  }

  _baseCleanup (): Promise<void> {
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.originalSourceCode);
    Object.keys(require.cache)
      .filter(key => this._cache.has(key))
      .forEach(key => delete require.cache[key]);
    return Promise.resolve();
  }
}

export = BaseRunner;
