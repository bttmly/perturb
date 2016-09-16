const BINARY_OPERATOR_SWAPS = require("../../built/constants/binary-operator-swaps.js");

const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "swap-binary-operators";

const cases = Object.keys(BINARY_OPERATOR_SWAPS).map(function (original) {
  const replacement = BINARY_OPERATOR_SWAPS[original];
  const before = [1, original, 2, ";"].join("");
  const after = [1, replacement, 2, ";"].join("");
  return {
    before, after, descr: `it replaces ${original} with ${replacement}`
  }
});

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));
