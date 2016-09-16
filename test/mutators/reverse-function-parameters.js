const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "reverse-function-parameters";

const cases = [
  {
    descr: "reverses arguments for function expression",
    before: "(function(a,b,c){});",
    after: "(function(c,b,a){});",
  },
  {
    descr: "reverses arguments for function declaration",
    before: "function x(a,b,c){}",
    after: "function x(c,b,a){}",
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));