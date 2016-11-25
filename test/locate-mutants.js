const S = require("estraverse").Syntax;
const esprima = require("esprima");
const expect = require("expect");

const mocks = require("./mocks/mutators");

const locateMutants = require("../built/locate-mutants");

describe("locateMutants", function () {
  it("locates correctly in the simple case", function () {
    const mutator = mocks.createNoopMutator([S.IfStatement]);
    const locator = mocks.createMutatorLocator([mutator]);
    const locations = locateMutants(locator, simple);
    expect(locations.length).toBe(4);
    locations.every(l => expect(l.node.type).toBe(S.IfStatement));
    locations.every(l => expect(l.mutator).toBeA(Object));
  });

  it("applies the filter if present", function () {
    const filter = node => node.test.name !== "z";
    const mutator = mocks.createNoopMutator([S.IfStatement], filter);
    const locator = mocks.createMutatorLocator([mutator]);
    const locations = locateMutants(locator, simple);
    expect(locations.length).toBe(2); // two `if (z)` nodes filtered out
    locations.every(l => expect(l.node.type).toBe(S.IfStatement));
    locations.every(l => expect(l.mutator).toBeA(Object));
  });

  it("honors enable/disable comments", function () {
    const mutator = mocks.createNoopMutator([S.IfStatement]);
    const locator = mocks.createMutatorLocator([mutator]);
    const locations = locateMutants(locator, withComments);
    expect(locations.length).toBe(2); // two `if`s are in the disabled block
    locations.every(l => expect(l.node.type).toBe(S.IfStatement));
    locations.every(l => expect(l.mutator).toBeA(Object));
  });
});

const ESPRIMA_SETTINGS = {
  loc: true,
  comment: true,
  attachComment: true,
};

const simple = esprima.parse(`
  var x, y, z;

  if (x) {}

  if (y) { if (z) {} }

  if (z) {}
`, ESPRIMA_SETTINGS);

const withComments = esprima.parse(`
  var x, y, z;

  if (x) {}

  // perturb-disable: mock-mutator
  if (y) { if (z) {} }
  // perturb-enable: mock-mutator

  if (z) {}
`, ESPRIMA_SETTINGS);
