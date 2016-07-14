const expect = require("expect");
const { nodeFromCode, applyMutation } = require("../helpers");

describe("reverse-function-parameters", function () {
  it("reverses the order of a function's declaration's arguments", function () {
    const node = nodeFromCode("function func (a, b, c, d) {}");
    const mutated = applyMutation(node, "reverse-function-parameters");
    const paramNames = mutated.params.map(p => p.name);
    expect(paramNames).toEqual(["d", "c", "b", "a"]);
  });

  it("reverses the order of a function's expression's arguments", function () {
    const node = nodeFromCode("(function (a, b, c) {})").expression
    const mutated = applyMutation(node, "reverse-function-parameters");
    const paramNames = mutated.params.map(p => p.name);
    expect(paramNames).toEqual(["c", "b", "a"]);
  });
});
