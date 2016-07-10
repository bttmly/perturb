const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const nodeFromCode = helpers.nodeFromCode;

describe("reverse-function-parameters", function () {
  it("reverses the order of a function's declaration's arguments", function () {
    const node = nodeFromCode("function func (a, b, c, d) {}");
    const m = mutatorByName("reverse-function-parameters");
    const mutated = m.mutator(node);
    const paramNames = mutated.params.map(p => p.name);
    expect(paramNames).toEqual(["d", "c", "b", "a"]);
  });

  it("reverses the order of a function's expression's arguments", function () {
    const node = nodeFromCode("(function (a, b, c) {})").expression
    const m = mutatorByName("reverse-function-parameters");
    const mutated = m.mutator(node);
    const paramNames = mutated.params.map(p => p.name);
    expect(paramNames).toEqual(["c", "b", "a"]);
  });
});
