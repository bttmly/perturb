const PLUGIN_NAME = "tweak-switch";

const cases = [
  {
    descr: "drops each member of an object",
    before: "switch(x){case 1:break;case 2: break; case 3:break;}",
    after: [
      "switch(x){case 2:break;case 3:break;}",
      "switch(x){case 1:break;case 3:break;}",
      "switch(x){case 1:break;case 2:break;}",
    ],
  },
    {
    descr: "noop on empty switch",
    before: "switch(x){}",
    after: [],
  },
];

testMutator(PLUGIN_NAME, cases)
