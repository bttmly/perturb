const expect = require("expect");
const helpers = require("../helpers");
const { nodeFromCode, applyMutation } = require("../helpers");

describe("tweak-object-literal", function () {
  it("removes the first property of an object literal", function () {
    const node = nodeFromCode("({a: 1, b: 2, c: 3})").expression;
    expect(node.type).toEqual("ObjectExpression");
    const nodes = applyMutation(node, "tweak-object-literal");

    expect(nodes.length).toEqual(3);
    expect(nodes[0].properties.length).toEqual(2);
    expect(nodes[0].properties[0].key.name).toEqual("b");
    expect(nodes[0].properties[1].key.name).toEqual("c");
    expect(nodes[0].properties[0].value.value).toEqual(2);
    expect(nodes[0].properties[1].value.value).toEqual(3);
  });
});
