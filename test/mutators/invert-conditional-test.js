const PLUGIN_NAME = "invert-conditional-test";

const cases = [
  {
    descr: "inverts an if clause",
    before: "if(x){y();}",
    after: "if(!x){y();}",
  },
  {
    descr: "inverts an inverted if clause",
    before: "if(!x){y();}",
    after: "if(!!x){y();}",
  },
  {
    descr: "it inverts a ternary",
    before: "x?y:z;",
    after: "!x?y:z;",
  },
  {
    descr: "inverts switch cases",
    before: "switch(x){case true:break;}",
    after: "switch(x){case!true:break;}",
  },
  {
    descr: "doesn't match a `default` case",
    before: "switch(x){default:break;}",
    noMatch: true,
  },
];

testMutator(PLUGIN_NAME, cases);
