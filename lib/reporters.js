module.exports = {
  defaultReporter: function defaultReporter (err, matches) {
    if (err) throw err;
  }
};

var util = require("./util");


module.exports = {
  defaultMatchReporter: function defaultMatchReporter (err, matches) {

  },

  defaultMutantReporter: function defaultMutantReporter (mutant) {
    console.log(util.prettyPrintMutant(mutant));
  },

  defaultSummaryReporter: function defaultSummaryReporter (summary) {

  }
}