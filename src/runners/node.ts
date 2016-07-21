import BaseRunner = require("./base");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

class NodeRunner extends BaseRunner implements RunnerPlugin {
  name: string;

  constructor (m: Mutant) {
    super(m);
    this.name = "node";
  }

  setup () { return this._baseSetup(); }

  run () {
    return Promise.resolve(require(this._mutant.sourceFile))
      .then(() => Object.assign({}, this._mutant, { error: null }))
      .catch(error => Object.assign({}, this._mutant, { error }));
  }

  cleanup () { return this._baseCleanup(); }
}

Object.defineProperty(NodeRunner, "name", {
  value: "node",
  enumerable: true,
});

export = NodeRunner;
