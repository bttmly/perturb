"use strict";

// bad stuff
// Error.stackTraceLimit = 100;
// process.setMaxListeners(0);

console.log("TYPEOF LOG", typeof console.log);

process.on("newListener", function () {
  // console.log("NEW LISTENER:", process._events);
});

// process.on("removeListener", function () {
//   console.log("REMOVE LISTENER");
//   console.trace();
// });

process.env.PERTURB = true;

var assert = require("assert");
var fs = require("fs");

var _ = require("lodash");
var async = require("async");
var glob = require("glob");

var validateConfig = require("./types/config");
var matchFiles = require("./match-files");
var createMutants = require("./handle-match");
var runMutant = require("./run-mutant");
var fileSystem = require("./file-system");

var isFunction = require("./util/is-function");
var get = require("./util/get");
var ERRORS = require("./constant/errors");

function perturb (config, done) {
  validateConfig(config);

  console.log("Pertrubing with config");
  console.log(config);

  assert(isFunction(done), ERRORS.NoCallback);

  function cleanup (err, output) {
    fileSystem.teardown(config);
    done(err, output);
  }

  fileSystem.setup(config);

  var perturbSourceFiles = glob.sync(config.perturbSourceDir + config.sourceGlob);
  var perturbTestFiles = glob.sync(config.perturbTestDir + config.testGlob);
  var matches = matchFiles(perturbSourceFiles, perturbTestFiles, config.matcher);

  if (matches.length === 0) return cleanup(new Error(ERRORS.NoMatches));

  var start = Date.now();

  //  var mutantsBySourceFile = matchFiles(perturbSourceFiles, perturbTestFiles, config.matcher)
  //    .map(createMutants(config)).filter(get("length"));
  //    

  var mutantsBySourceFile = matches.map(createMutants(config)).filter(get("length"));

  async.mapSeries(mutantsBySourceFile, makeSourceGroupHandler(config), function (err, processedMatches) {
    if (err) return cleanup(err);

    // now we're at the per-source file level
    var oneToOneMatches = _.flatten(processedMatches);

    // pluck and flatten to get a single list of all mutants
    var mutants = _.flatten(_.pluck(oneToOneMatches, "mutants"));

    var meta = {
      duration: Date.now() - start,
      matchesCount: processedMatches.length,
      mutantCount: mutants.length,
      killedMutants: mutants.filter(function (m) { return m.failed; }).length,
    };

    meta.killRate = meta.killedMutants / meta.mutantCount;

    cleanup(null, {
      meta: meta,
      config: config,
      matches: matches,
    });
  });
}


function makeSourceGroupHandler (config) {

  return function sourceGroupHandler (mutants, cb) {
    var sourceCode = mutants[0].sourceCode;
    var sourceFile = mutants[0].sourceFile;

    var mapMethod = config.parallel ? async.map : async.mapSeries;

    console.log(sourceFile, "starting....");
    mapMethod(mutants, runMutant(config), function (err, processedMutants) {
      if (err) {
        console.log("ERR!", err);
        return done(err);
      }
      
      fs.writeFileSync(sourceFile, sourceCode);


      return cb(null, {
        sourceFile: sourceFile,
        testFiles: _(mutants).pluck("testFile").unique().values(),
        mutants: processedMutants,
      });
    });
  }

}


module.exports = perturb;
