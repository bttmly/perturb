const PLUGIN_NAME = "tweak-array-literal";

const cases = [
  {
    descr: "drops each member of an array",
    before: "[1,2,3]",
    after: [
      "[2,3];",
      "[1,3];",
      "[1,2];",
    ],
  },
];

testMutator(PLUGIN_NAME, cases);
