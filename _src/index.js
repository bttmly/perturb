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
const report = require("./reporters").diff;

const fileSystem = require("./file-system");
const generateConfig = require("./generate-config");

// var ERRORS = require("./constant/errors");

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

        mutations.forEach(m => {
          if (m.sourceCode === m.mutatedSourceCode) {
            throw new Error("Mutation not applied! " + m.name);
          }
        })

        // TODO make this a stream for live result reporting
        Future.mapSeries(mutations, runMutation)
          .then(function (results) {
            results.map(report).map(r => r.print());
            console.log("kill count", results.filter(r => r.error).length, "/", results.length)
          });
      });
  });
}

const killCount = R.pipe(
  R.filter(R.prop("failed")),
  R.prop("length")
);

module.exports = perturb;
