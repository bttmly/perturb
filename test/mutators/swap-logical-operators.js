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

testMutator(PLUGIN_NAME, cases);
