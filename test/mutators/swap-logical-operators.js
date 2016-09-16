const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "swap-logical-operators";

const cases = [
  {
    descr: "changes || to &&",
    before: "x||y;",
    after: "x&&y;",
  },
  {
    descr: "changes && to ||",
    before: "x&&y;",
    after: "x||y;",
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));