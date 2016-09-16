const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "tweak-arguments";

const cases = [
  {
    descr: "drops each member of an object",
    before: "f(a,b,c);",
    after: [
      "f(b,c);",
      "f(a,c);",
      "f(a,b);",
    ],
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));