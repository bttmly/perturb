"use strict";

// bad stuff
// Error.stackTraceLimit = 100;
// process.setMaxListeners(0);

process.env.PERTURB = true;

const assert = require("assert");
const fs = require("fs");

const R = require("ramda");
const _ = require("lodash");
const async = require("async");
const glob = require("glob");
const Future = require("bluebird");

const matchFiles = require("./match-files");
const makeMutations = require("./make-mutations");
const runMutation = require("./run-mutation");

const fileSystem = require("./file-system");
const generateConfig = require("./generate-config");

// var isFunction = require("./util/is-function");
// var get = require("./util/get");
// var ERRORS = require("./constant/errors");

// const getMutantsBySourceFile = R.pipe(
//   R.map(createMutants(config)),
//   R.reject(R.isEmpty),
// );

const pGlob = Future.promisify(glob);
const pMap = R.flip(Future.map);
const notEmpty = R.complement(R.isEmpty);

// hasTests :: Match -> Boolean
const hasTests = R.pipe(R.path(["tests", "length"]), Boolean);

/*
type Match {
  source: String,
  tests: [String],
  runner: Mutation -> Promise<Result>
}

type Mutation 

*/

function perturb (_cfg) {

  const config = generateConfig(_cfg);
  console.log("Pertrubing with config");
  console.log(config);
  
  return new Future(function (resolve, reject) {

    fileSystem.setup(config);

    const start = Date.now();
    const sources = pGlob(config.perturbSourceDir + config.sourceGlob);
    const tests = pGlob(config.perturbTestDir + config.testGlob);

    Future.props({sources, tests})
      .then(function ({sources, tests}) {
        
        var matches = matchFiles(config, sources, tests).filter(hasTests);
        console.log("MATCHES", matches.length);
        // if (matches.length === 0) throw new Error("no matches");

        var mutations = R.chain(makeMutations, matches);
        console.log("mutations", mutations.length);

        Future.mapSeries(mutations, runMutation)
          .then(function (results) {
            console.log("\n\n\n\n\n\n\n\n");
            console.log("------------------------");
            console.log("------------------------");
            console.log("------------------------");
            console.log("------------------------");
            console.log("------------------------");
            console.log("\n\n\n\n\n\n\n\n");
            console.log("KILLED", results.filter(r => r.failedOn).length);
          });
      });
  });
}

// function createMutantReport (mutants) {

//   // TODO remove this is for backwards compat
//   const matches = {};

//   const meta = {
//     duration: Date.now() - start,
//     matchesCount: matches.length,
//     mutantCount: mutants.length,
//     killedMutants: killCount(mutants),
//   };

//   meta.killRate = meta.killedMutants / meta.mutantCount;
//   return {meta, config, matches, mutants}
// }

// const makeMutantRunner = R.curry(function (config, mutants) {
//   const {sourceFile, sourceCode} = mutants[0];
  
//   return Future.map(mutants, runMutant(config))
//     .then(processed => ({
//         sourceFile,
//         testFiles: R.unique(R.pluck("testFile", mutants)),
//         mutants: processed,
//     }))
//     .finally(() => fs.writeFileSync(sourceFile, sourceCode));
// });

const killCount = R.pipe(
  R.filter(R.prop("failed")),
  R.prop("length")
);

module.exports = perturb;
