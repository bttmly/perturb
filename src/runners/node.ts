///<reference path="./mocha.d.ts"/>

const fs = require("fs");
const R = require("ramda");
const Bluebird = require("bluebird");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

const doesNotHave = set => prop => !set.has(prop);
const delProp = obj => prop => delete obj[prop];

module.exports = <RunnerPlugin>{

  name: "node-sync",

  setup: function (m: Mutant): Promise<any> {
    fs.writeFileSync(m.sourceFile, m.mutatedSourceCode);

    delete require.cache[m.sourceFile];

    return Promise.resolve({
      cache: new Set(Object.keys(require.cache)),
    });
  },

  run: function (m: Mutant): Promise<RunnerResult> {
    const result: RunnerResult = R.clone(m);

    try {
      require(m.sourceFile);
    } catch (e) {
      result.error = e;
    }

    return Promise.resolve(result);
  },

  cleanup: function (m: Mutant, before: any): Promise<void> {
    // write the original source code back to it's location
    fs.writeFileSync(m.sourceFile, m.originalSourceCode);

    // remove all modules that were required by this test
    Object.keys(require.cache)
      .filter(doesNotHave(before.cache))
      .forEach(delProp(require.cache));

    return Promise.resolve();
  }
};
