const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const nodeFromCode = helpers.nodeFromCode;

const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "drop-return"

const cases = [
  {
    descr: "removes a return statement, leaving the argument",
    before: "function id(x){return f();}",
    after: "function id(x){f();}",
    // log: true,
  },
  {
    descr: "removes a return statement, leaving the argument",
    before: "function id(x){return;}",
    after: "function id(x){(void 0)}",
    // log: true,
  },
]

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)))

