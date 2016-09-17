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
  });

  it("applies the filter if present", function () {
    const filter = node => node.test.name !== "z";
    const mutator = mocks.createNoopMutator([S.IfStatement], filter);
    const locator = mocks.createMutatorLocator([mutator]);
    const locations = locateMutants(locator, simple);
    expect(locations.length).toBe(2); // two nodes filtered out
    locations.every(l => expect(l.node.type).toBe(S.IfStatement));
  });

  it("honors enable/disable comments", function () {
    const mutator = mocks.createNoopMutator([S.IfStatement]);
    const locator = mocks.createMutatorLocator([mutator]);
    const locations = locateMutants(locator, withComments);
    expect(locations.length).toBe(2);
    locations.every(l => expect(l.node.type).toBe(S.IfStatement));
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

  // perturb-disable: noop-mutator
  if (y) { if (z) {} }

  // perturb-enable: noop-mutator

  if (z) {}
`, ESPRIMA_SETTINGS);