const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const makeNodeOfType = helpers.makeNodeOfType;

describe("invert-conditional-test", function () {
  it("inverts the test property of the node", function () {
    const arg = "someIdentifier";
    const node = makeNodeOfType("IfStatement", {test: arg});
    const m = mutatorByName("invert-conditional-test");
    const test = m.mutator(node).test
    expect(test.type).toEqual("UnaryExpression");
    expect(test.operator).toEqual("!");
    expect(test.argument).toEqual(arg);
  });
});
