const PLUGIN_NAME = "drop-return"

const cases = [
  {
    descr: "removes a return statement, leaving the argument",
    before: "function id(x){return f();}",
    after: "function id(x){f();}",
    // log: true,
  },
  {
    descr: "removes a return statement, leaving the argument",
    before: "function id(x){return;}",
    after: "function id(x){(void 0)}",
    // log: true,
  },
];

testMutator(PLUGIN_NAME, cases);
