const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "drop-member-assignment";

const cases = [
  {
    descr: "drops a member assignment",
    before: "x.y=z",
    after: "x.y;",
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));
