const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "drop-operator";

const cases = [
  {
    descr: "drops a throw statement",
    before: "throw new Error()",
    after: "new Error()",
  },
  {
    descr: "drops a unary +",
    before: "+x();",
    after: "x();",
  },
  {
    descr: "drops a unary -",
    before: "var x=-1;",
    after: "var x=1;",
  },
  {
    descr: "drops a `delete`",
    before: "delete x.y;",
    after: "x.y;",
  },
  {
    descr: "drops a `typeof`",
    before: "typeof 1;",
    after: "1;",
  },
  {
    descr: "drops a `void`",
    before: "void 0;",
    after: "0;",
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));
