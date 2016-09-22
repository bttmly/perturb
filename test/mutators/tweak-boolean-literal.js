const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "tweak-boolean-literal";

const cases = [
  {
    descr: "changes `false` to `true`",
    before: "false;",
    after: "true;",
  },
  {
    descr: "changes `true` to `false`",
    before: "true;",
    after: "false;",
  },
  {
    descr: "doesn't change strings",
    before: "'str';",
    after: "'str';",
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));