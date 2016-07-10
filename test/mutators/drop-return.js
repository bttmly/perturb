const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const nodeFromCode = helpers.nodeFromCode;

describe("drop-return", function () {
  it("removes a return statement, leaving the argument", function () {
    const node = nodeFromCode("function id (x) { return x; }").body.body[0];
    expect(node.type).toEqual("ReturnStatement");
    const m = mutatorByName("drop-return");
    expect(node.argument).toExist();
    const mutated = m.mutator(node);
    expect(mutated.expression.type).toEqual("Identifier");
    expect(mutated.expression.name).toEqual("x");
  });

  it("removes a return statement without an argument, replacing it with `void 0;`", function () {
    const node = nodeFromCode("function id (x) { return; }").body.body[0];
    expect(node.type).toEqual("ReturnStatement");
    const m = mutatorByName("drop-return");
    expect(node.argument).toNotExist();
    const mutated = m.mutator(node);
    expect(mutated.type).toEqual("UnaryExpression");
    expect(mutated.operator).toEqual("void");
    expect(mutated.argument.type).toEqual("Literal");
    expect(mutated.argument.value).toEqual(0);
    expect(mutated.prefix).toEqual(true);
  });
});
