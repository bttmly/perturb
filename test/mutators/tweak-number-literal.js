const R = require("ramda");
const expect = require("expect");
const helpers = require("../helpers");
const {mutateAndCompare} = require("../helpers");

const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "tweak-number-literal";

const beforeToAfter = [
  [1, "0;"],
  [0, "1;"],
  [-1, "-0;"],
  [-99, "-100;"],
  [99, "100;"],
  ["'str';", "'str';"],
];

function makeCasesFromArray (arr) {
  return arr.map(function ([before, after]) {
    return {before, after, descr: `changes ${before} to ${after}`};
  });
}

describe(PLUGIN_NAME, () => 
  makeCasesFromArray(beforeToAfter).forEach(testPlugin(PLUGIN_NAME)))