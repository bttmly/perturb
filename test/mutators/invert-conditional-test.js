const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "invert-conditional-test";

const cases = [
  {
    descr: "inverts an if clause",
    before: "if(x){y();}",
    after: "if(!x){y();}",
  },
  {
    descr: "inverts an inverted if clause",
    before: "if(!x){y();}",
    after: "if(!!x){y();}",
  },
  {
    descr: "it inverts a ternary",
    before: "x?y:z;",
    after: "!x?y:z;",
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));
