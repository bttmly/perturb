const PLUGIN_NAME = "drop-node";

const cases = [
  {
    descr: "drops a `break` statement",
    before: "switch(x){case 1: break;}",
    after: "switch(x){case 1:(void 0)}",
  },
  {
    descr: "drops a `continue` statement",
    before: "while(x){continue;}",
    after: "while(x){(void 0)}",
  },
];

testMutator(PLUGIN_NAME, cases);
