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
const through2 = require("through2");

const matchFiles = require("./match-files");
const makeMutations = require("./make-mutations");
const runMutation = require("./run-mutation");
const getReporter = require("./reporters");

const fileSystem = require("./file-system");
const generateConfig = require("./generate-config");
const mapSeriesStream = require("./util/map-series-stream");

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


// make file-system module work like this
// (may help for spawning multiple parallel perturb
// processes side-by-side)
function tempFiles (config) {
  return {
    setup () {
      fileSystem.setup(config);
    },
    teardown () {
      fileSystem.teardown(config);
    },
  }
}

// TODO allow configure
const reporter = getReporter("diff");

function perturb (_cfg) {

  const config = generateConfig(_cfg);
  console.log("Pertrubing with config");
  console.log(config);
  
  const {setup, teardown} = tempFiles(config);

  setup();

  return new Future(function (resolve, reject) {  

    const start = Date.now();
    const sources = glob.sync(config.perturbSourceDir + config.sourceGlob);
    const tests = glob.sync(config.perturbTestDir + config.testGlob);
        
    // matchFiles :: Config -> [String] -> [String] -> [Match]
    const matches = matchFiles(config, sources, tests).filter(hasTests);

    console.log("after matches");

    // makeMutations :: Match -> [Mutation]
    const mutations = R.chain(makeMutations, matches);

    console.log("after mutations");

    // runMutation :: Mutation -> Promise<Result>
    // mapSeriesStream :: (T -> Promise<Result>) -> [T] -> ReadableStream<Promise<Result>>
    const st = mapSeriesStream(runMutation, mutations)

    console.log("after stream");

    // resultReporter :: Result -> Any?
    // provided for visual reporters to give output as the test is running
    st.pipe(streamifyReporter(reporter));

    // aggregateReporter :: [Result] -> Any?
    //
    // provided for all runners to do things like "74% mutations killed", and
    // for reporters who write, say, structured results to the file system
    st.on("complete", function (results) {
      teardown();
      resolve(results);
    })
  });
}

function streamifyReporter (reporter) {
  return through2.obj(function (data, enc, next) {
    reporter(data).print();
    next();
  });
}

module.exports = perturb;
