"use strict";

var prettyPrintMutant = require("./util/pretty-print-mutant");

function out () {
  return console.log.apply(console, arguments);
}

// var out = function () {}

module.exports = {
  configReporter: function defaultConfigReporter (config) {
    out(config);
  },

  matchReporter: function defaultMatchReporter (err, matches) {
    if (err) throw err;
    out(matches);
  },

  mutantReporter: function defaultMutantReporter (mutant) {
    out(prettyPrintMutant(mutant));
  },

  summaryReporter: function defaultSummaryReporter (summary) {
    out(summary);
  },

  __injectOutputFunc: function (fn) {
    out = fn;
  },
};
