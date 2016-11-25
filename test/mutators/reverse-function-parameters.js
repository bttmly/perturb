const PLUGIN_NAME = "reverse-function-parameters";

const cases = [
  {
    descr: "reverses arguments for function expression",
    before: "(function(a,b,c){});",
    after: "(function(c,b,a){});",
  },
  {
    descr: "reverses arguments for function declaration",
    before: "function x(a,b,c){}",
    after: "function x(c,b,a){}",
  },
  {
    descr: "reverses arguments for an arrow function",
    before: "const x=(a,b,c)=>{};",
    after: "const x=(c,b,a)=>{};",
  },
  {
    descr: "doesn't do anything to a unary function",
    before: "function x(a){}",
    noMatch: true,
  },
  {
    descr: "doesn't do anything to a nullary function",
    before: "function x(){}",
    noMatch: true,
  },
];

testMutator(PLUGIN_NAME, cases);
