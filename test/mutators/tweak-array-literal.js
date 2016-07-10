const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const nodeFromCode = helpers.nodeFromCode;

describe("tweak-array-literal", function () {
  it("removes the first element of an array literal", function () {
    const node = nodeFromCode("[1, 2, 3]").expression;
    expect(node.type).toEqual("ArrayExpression");
    const m = mutatorByName("tweak-array-literal");
    const mutated = m.mutator(node);
    expect(mutated.elements.length).toEqual(2);
    expect(mutated.elements[0].value).toEqual(2);
    expect(mutated.elements[1].value).toEqual(3);
  });
});
