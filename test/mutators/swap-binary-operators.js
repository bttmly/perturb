const BINARY_OPERATOR_SWAPS = require("../../built/constants/binary-operator-swaps.js");

const PLUGIN_NAME = "swap-binary-operators";

let cases = Object.keys(BINARY_OPERATOR_SWAPS).map(function (original) {
  const replacement = BINARY_OPERATOR_SWAPS[original];
  const before = [1, original, 2, ";"].join("");
  const after = [1, replacement, 2, ";"].join("");
  return {
    before, after, descr: `it replaces ${original} with ${replacement}`,
  }
}).concat()

cases.push({
  descr: "it doesn't change 'in'",
  before: "x in y;",
  noMatch: true,
});

testMutator(PLUGIN_NAME, cases);
