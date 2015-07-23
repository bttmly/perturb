"use strict";

var assign = require("object-assign");
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

module.exports = {
  formatMutation: formatMutation,
  generateDiff: generateDiff,
};
