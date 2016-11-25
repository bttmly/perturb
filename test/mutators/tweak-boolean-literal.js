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
    noMatch: true,
  },
];

testMutator(PLUGIN_NAME, cases)
