const {spawn} = require("child_process");
const fs = require("fs");
const debug = require("debug")("runner:mocha-child-process");
const Bluebird = require("bluebird");

import {
  RunnerPlugin,
  Mutant,
  RunnerResult
} from "../types";

module.exports = <RunnerPlugin>{
  name: "mocha-child-process",

  setup (m: Mutant): Promise<any> {
    fs.writeFileSync(m.sourceFile, m.mutatedSourceCode);
    return Promise.resolve();
  },

  run (m: Mutant): Promise<RunnerResult> {
    return Bluebird.mapSeries(m.testFiles, makeFileRunner(m))
      .then(() => Object.assign({}, m, { error: null }))
      .catch(err => Object.assign({}, m, { error: err }));
  },

  cleanup (m: Mutant): Promise<void> {
    fs.writeFileSync(m.sourceFile, m.originalSourceCode);
    return Promise.resolve();
  }
}

const TIMEOUT = 10000;


// this function *rejects* if there is an error so we can skip
// running subsequent test files
function makeFileRunner (m: Mutant) {
  const cmd = getMocha(m);
  return function runOne (testFile: string) {
    return new Promise(function (resolve, reject) {
      // TODO should use locally installed mocha if available
      const opts = { timeout: TIMEOUT };
      const child = spawn(cmd, ["-b", testFile]);

      child.stdout.on("data", d => debug(d.toString()));
      child.stderr.on("data", d => debug(d.toString()));

      let ended = false;
      
      child.on("error", err => {
        if (ended) {
          console.log("Error in child process after ended", err.stack);
          return;
        }

        ended = true;
        reject(err);
      });

      child.on("exit", code => {
        if (code === 0) return resolve();
        if (ended) return;

        ended = true;
        console.log("code not zero, but no child error!", code, typeof code);
        reject(new Error("Non-zero exit code from child process"));
      });
    })
  }
}

function getMocha (m: Mutant) {
  return "mocha";
}
