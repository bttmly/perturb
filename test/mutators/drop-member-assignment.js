const PLUGIN_NAME = "drop-member-assignment";

const cases = [
  {
    descr: "drops a member assignment",
    before: "x.y=z",
    after: "x.y;",
  },
  {
    descr: "regular assignments are ok",
    before: "x=z;",
    noMatch: true,
  },
];

testMutator(PLUGIN_NAME, cases);
