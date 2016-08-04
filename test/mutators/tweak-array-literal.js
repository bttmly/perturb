const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const nodeFromCode = helpers.nodeFromCode;

describe("tweak-array-literal", function () {
  it("removes the first element of an array literal", function () {
    const node = nodeFromCode("[1, 2, 3]").expression;
    expect(node.type).toEqual("ArrayExpression");
    const m = mutatorByName("tweak-array-literal");
    const nodes = m.mutator(node);
    expect(nodes.length).toEqual(3);
    expect(nodes[0].elements.length).toEqual(2);
    expect(nodes[0].elements[0].value).toEqual(2);
    expect(nodes[0].elements[1].value).toEqual(3);
  });
});
