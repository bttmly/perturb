const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "drop-member-assignment";

const cases = [
  {
    descr: "drops a member assignment",
    before: "x.y=z",
    after: "x.y;",
  },
  {
    descr: "regular assignments are ok",
    before: "x=z;",
    after: "x=z;",
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));
