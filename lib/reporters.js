"use strict";

var pkgUtil = require("./pkg-util");

var out = console.log.bind(console);

module.exports = {
  configReporter: function defaultConfigReporter (config) {
    out(config);
  },

  matchReporter: function defaultMatchReporter (err, matches) {
    if (err) throw err;
    out(matches);
  },

  mutantReporter: function defaultMutantReporter (mutant) {
    out(pkgUtil.prettyPrintMutant(mutant));
  },

  summaryReporter: function defaultSummaryReporter (summary) {
    out(summary);
  },

  __injectOutputFunc: function (fn) {
    out = fn;
  },
};
