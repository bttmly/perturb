"use strict";

var util = require("./util");

module.exports = {
  configReporter: function defaultConfigReporter (config) {
    console.log(config);
  },

  matchReporter: function defaultMatchReporter (err, matches) {
    if (err) throw(err);
    console.log(matches);
  },

  mutantReporter: function defaultMutantReporter (mutant) {
    console.log(util.prettyPrintMutant(mutant));
  },

  summaryReporter: function defaultSummaryReporter (summary) {
    console.log(summary);
  }
};