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
    noMatch: true,
  }, {
    descr: "does not remove method call",
    before: methodCall,
    noMatch: true,
  },
];

testMutator(PLUGIN_NAME, cases);
