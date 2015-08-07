"use strict";

var assign = require("object-assign");
var _ = require("lodash");
var diffLines = require("diff").diffLines;

function formatMutation (mutation) {
  var result = assign({}, mutation);
  result.loc = result.loc.start.line + "," + result.loc.start.column;
  if (!result.failed) {
    result.diff = generateDiff(mutation);
  }
  return result;
}

function generateDiff (mutation) {
  return diffLines(mutation.genSourceCode, mutation.mutSourceCode)
    .filter(function (node) {
      return (node.added || node.removed);
    });
}

function runnerReport (mutant, error) {
  var report = _.copy(mutant);
  if (error) {
    report.error = error;
    report.didError = true;
  }
  return report;
}

module.exports = {
  formatMutation: formatMutation,
  generateDiff: generateDiff,
};
