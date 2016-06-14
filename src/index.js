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
const Bluebird = require("bluebird");

const matchFiles = require("./match-files");
const makeMutations = require("./make-mutations");
const runMutation = require("./run-mutation");
const getReporter = require("./reporters");

const fileSystem = require("./file-system");
const generateConfig = require("./generate-config");
const mapSeriesStream = require("./util/map-series-stream");

// hasTests :: Match -> Boolean
const hasTests = R.pipe(R.path(["tests", "length"]), Boolean);

// make file-system module work like this
// (may help for spawning multiple parallel perturb
// processes side-by-side)

const reporter = getReporter("diff");

function perturb (_cfg) {
  const start = Date.now();
  const config = generateConfig(_cfg);
  console.log("Pertrubing with config");
  console.log(config);
  
  const {setup, teardown, paths} = fileSystem(config);

  setup();

  const {sources, tests} = paths();
      
  // matchFiles :: Config -> [String] -> [String] -> [Match]
  const matches = matchFiles(config, sources, tests).filter(hasTests);

  // makeMutations :: Match -> [Mutation]
  const mutations = R.chain(makeMutations, matches);

  // runMutation :: Mutation -> Promise<Result>
  // SingleResultReporter :: Result -> Any?
  // AllResultsReporter :: [Result] -> Any?

  return Bluebird.mapSeries(mutations, runAndReport)
    .then(results => {
    console.log("tearing down...");
    teardown();
    return results;
  });
}

function runAndReport (mutation) {
  return runMutation(mutation)
    .then(result => {
      reporter(result).print();
      return result;
    });
}

module.exports = perturb;
