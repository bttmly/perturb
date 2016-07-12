const fs = require("fs");

import { Mutant } from "../types";

class BaseRunner {

  _mutant: Mutant;
  _cache: Set<string>

  constructor (m: Mutant) {
    this._mutant = m;
    this._cache = new Set();
  }

  _baseSetup () {
    delete require.cache[this._mutant.sourceFile];
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.mutatedSourceCode);
    this._cache = new Set(Object.keys(require.cache));
    return Promise.resolve();
  }

  _baseTeardown () {
    fs.writeFileSync(this._mutant.sourceFile, this._mutant.originalSourceCode);
    Object.keys(require.cache)
      .filter(key => this._cache.has(key))
      .forEach(key => delete require.cache[key]);
    
    return Promise.resolve();
  }

}

/*
// ad hoc with property assignment
var runner = new BaseRunner();
runner.name = "";
runner.setup = function (m: Mutant) {
  return this._baseSetup(m);
}
runner.run = // ... implementation
runner.cleanup = function (m: Mutant) {
  return this._baseTeardown(m);
}

// as a class
class MyRunner extends BaseRunner implements Runner {
  setup (m) {
    return this._baseSetup(m);
  }
  cleanup (m) {
    return this._baseTeardown(m);
  }
}
*/