const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const nodeFromCode = helpers.nodeFromCode;

describe("swap-logical-operators", function () {
  it("changes `&&` to `||`", function () {
    const node = nodeFromCode("x && y;").expression;
    expect(node.type).toEqual("LogicalExpression");
    const m = mutatorByName("swap-logical-operators");
    const mutated = m.mutator(node);
    expect(mutated.operator).toEqual("||");
  });

  it("changes `||` to `&&`", function () {
    const node = nodeFromCode("x || y;").expression;
    expect(node.type).toEqual("LogicalExpression");
    const m = mutatorByName("swap-logical-operators");
    const mutated = m.mutator(node);
    expect(mutated.operator).toEqual("&&");
  });
});
