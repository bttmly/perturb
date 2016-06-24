///<reference path="../../typings/modules/ramda/index.d.ts"/>
///<reference path="./mocha.d.ts"/>


import * as fs from "fs";
import * as R from "ramda";
import * as Bluebird from "bluebird";
import * as Mocha from "mocha";

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

const doesNotContain = arr => item => !R.contains(item, arr);
const doesNotHave = obj => prop => !R.has(prop, obj);
const delProp = obj => prop => delete obj[prop];

function mirror (arr: string[]) {
  const out = {};
  arr.forEach(x => out[x] = x);
  return out;
}

export default <RunnerPlugin>{

  prepare: function (m: Mutant): Promise<any> {
    delete require.cache[m.sourceFile];
    fs.writeFileSync(m.sourceFile, m.mutatedSourceCode);
    return Promise.resolve({
      cache: mirror(Object.keys(require.cache)),
      listeners: process.listeners("uncaughtException"),
    });
  },

  run: function (m: Mutant): Promise<RunnerResult> {
    return new Promise(function(resolve) {
      let failedOn;

      const reporter = suite =>
        suite.on("fail", test => failedOn = test);

      const mocha = new Mocha({ reporter, bail: true });

      m.testFiles.forEach(t => mocha.addFile(t));

      try {
        mocha.run(() => resolve(failedOn));
      } catch (err) {
        return resolve(err);
      }
    })
      .then(error => Object.assign({}, m, { error }));
  },

  cleanup: function (m: Mutant, before: any): Promise<void> {
    // write the original source code back to it's location
    fs.writeFileSync(m.sourceFile, m.originalSourceCode);

    // remove danging uncaughtException listeners Mocha didn't clean up
    process.listeners("uncaughtException")
      .filter(doesNotContain(before.listeners))
      .forEach(f => process.removeListener("uncaughtException", f));

    // remove all modules that were required by this test
    Object.keys(require.cache)
      .filter(doesNotHave(before.cache))
      .forEach(delProp(require.cache));

    return Promise.resolve();
  }
};
