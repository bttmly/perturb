"use strict";

const fs = require("fs");

const R = require("ramda");
const Mocha = require("mocha");
const Future = require("bluebird");
const escodegen = require("escodegen");

const mapMirror = require("../util/map-mirror");

const doesNotContain = R.complement(R.flip(R.contains));
const doesNotHave = R.complement(R.flip(R.has));
const delProp = (obj: Object) => (prop: string) => delete obj[prop];

import { RunnerPlugin, MutationDescriptor } from "../types";

const plugin : RunnerPlugin = {

  prepare: function (m: MutationDescriptor): {
    delete require.cache[m.source];
    fs.writeFileSync(m.source, m.mutatedSourceCode);
    return Promise.resolve({
      cache: mapMirror(Object.keys(require.cache)),
      listeners: process.listeners("uncaughtException"),
    });
  },

  run: function (m: MutationDescriptor) {
    return new Promise(function(resolve) {
      let failedOn;

      const reporter = suite =>
        suite.on("fail", test => failedOn = test);

      const mocha = new Mocha({ reporter, bail: true });

      m.tests.forEach(t => mocha.addFile(t));

      try {
        mocha.run(() => resolve(failedOn));
      } catch (err) {
        return resolve(err);
      }
    })
      .then(error => Object.assign({}, m, { error }));
  },

  cleanup: function (m: MutationDescriptor, before: any) {
    // write the original source code back to it's location
    fs.writeFileSync(m.source, m.sourceCode);

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
}

export default plugin;
