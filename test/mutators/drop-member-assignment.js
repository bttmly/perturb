const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const nodeFromCode = helpers.nodeFromCode;

describe("drop-member-assignment", function () {
  it("drops a member assignment", function () {
    const node = nodeFromCode("x.y = 100;").expression
    expect(node.type).toEqual("AssignmentExpression");
    const m = mutatorByName("drop-member-assignment");
    const mutated = m.mutator(node);
    expect(mutated.type).toEqual("MemberExpression");
  });
});
