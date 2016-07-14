
const expect = require("expect");
const R = require("expect");
const { nodeFromCode, applyMutation } = require("../helpers")

describe("tweak-boolean-literal", function () {
  it("changes true to false", function () {
    const node = nodeFromCode("var bool = true");
    const literal = node.declarations[0].init;

    console.log(node);
  });

  it("changes false to true", function () {
    const node = nodeFromCode("var bool = false");
  });
});
