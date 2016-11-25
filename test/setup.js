
console.log("setup!");

const helpers = require("./helpers");

global.testMutator = function (name, cases) {
  describe(name, function () {
    const tester = helpers.makeMutationTester(name)
    cases.forEach(tester);
  });
}
