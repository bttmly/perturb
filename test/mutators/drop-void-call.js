const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "drop-void-call";

const voidNode = "void 0"
const withoutAssignment = "x();";
const withAssignment= "const y = x();"
const methodCall = "x.y();";

const cases = [
  {
    descr: "removes function call without assignment",
    before: withoutAssignment,
    after: voidNode,
  }, {
    descr: "does not remove function call with assignment",
    before: withAssignment,
    after: withAssignment,
  }, {
    descr: "does not remove method call",
    before: methodCall,
    after: methodCall,
  },
];

describe(PLUGIN_NAME, () => cases.forEach(testPlugin(PLUGIN_NAME)));
