const expect = require("expect");
const helpers = require("../helpers");
const { nodeFromCode, applyMutation } = require("../helpers");

describe("tweak-object-literal", function () {
  it("removes the first property of an object literal", function () {
    const node = nodeFromCode("x = {a: 1, b: 2, c: 3}").expression.right;
    expect(node.type).toEqual("ObjectExpression");
    const mutated = applyMutation(node, "tweak-object-literal");
    expect(mutated.properties.length).toEqual(2);
    expect(mutated.properties[0].key.name).toEqual("b");
    expect(mutated.properties[1].key.name).toEqual("c");
    expect(mutated.properties[0].value.value).toEqual(2);
    expect(mutated.properties[1].value.value).toEqual(3);
  });
});
