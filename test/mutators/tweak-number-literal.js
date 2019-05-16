const PLUGIN_NAME = "tweak-number-literal";

const beforeToAfter = [
  [1, ["0;", "2;"]],
  [0, "1;"],
  [-1, ["-0;", "-2;"]],
  [-99, "-100;"],
  [99, "100;"],
  ["'str';", "'str';"],
];

function makeCasesFromArray(arr) {
  return arr.map(([before, after]) => {
    if (before === after) {
      return { before, noMatch: true, descr: `does not change ${before}` };
    }
    return { before, after, descr: `changes ${before} to ${after}` };
  });
}

// global
testMutator(PLUGIN_NAME, makeCasesFromArray(beforeToAfter));
