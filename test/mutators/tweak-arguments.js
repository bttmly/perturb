const PLUGIN_NAME = "tweak-arguments";

const cases = [
  {
    descr: "drops each argument to a function call",
    before: "f(a,b,c);",
    after: [
      "f(b,c);",
      "f(a,c);",
      "f(a,b);",
    ],
  },
  {
    descr: "drops a single argument if given",
    before: "f(a);",
    after: ["f();"],
  },
  {
    descr: "doesn't affect a nullary call",
    before: "f();",
    noMatch: true,
  },
];

testMutator(PLUGIN_NAME, cases);
