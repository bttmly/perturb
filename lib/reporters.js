"use strict";

module.exports = {
  defaultReporter: function defaultReporter (err, matches) {
    if (err) throw err;
    console.log(matches);
  }
};

var util = require("./util");

module.exports = {
  defaultMatchReporter: function defaultMatchReporter (err, matches) {
    if (err) throw(err);
    console.log(matches);
  },

  defaultMutantReporter: function defaultMutantReporter (mutant) {
    console.log(util.prettyPrintMutant(mutant));
  },

  defaultSummaryReporter: function defaultSummaryReporter (summary) {
    console.log(summary);
  }
};