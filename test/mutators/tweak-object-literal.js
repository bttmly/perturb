const {testPlugin} = require("../helpers");

const PLUGIN_NAME = "tweak-object-literal";

const cases = [
  {
    descr: "drops each member of an object",
    before: "({a:1,b:2,c:3})",
    after: [
      "({b:2,c:3});",
      "({a:1,c:3});",
      "({a:1,b:2});",
    ],
  },
  // {
  //   descr: "drops each member of an object",
  //   before: "({})",
  //   after: "({});",
  // },
];

testMutator(PLUGIN_NAME, cases)
