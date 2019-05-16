console.log("setup!");

const helpers = require("./helpers");

function testMutator(name, cases) {
  describe(name, function() {
    const tester = helpers.makeMutationTester(name);
    cases.forEach(tester);
  });
}

global.testMutator = testMutator;
