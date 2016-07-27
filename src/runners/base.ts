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
    Object.keys(require.cache).forEach(k => delete require.cache[k]);
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.mutatedSourceCode);
    return Promise.resolve();
  }

  _baseCleanup (): Promise<void> {
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.originalSourceCode);
    return Promise.resolve();
  }
}

export = BaseRunner;
