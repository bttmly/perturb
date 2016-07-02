"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;

describe("dropMemberAssignment", function () {
  it("drops a member assignment", function () {
    var node = nodeFromCode("x.y = 100;").expression
    expect(node.type).to.equal("AssignmentExpression");
    var m = mutatorByName("dropMemberAssignment");
    var mutated = m.mutator(node);
    expect(mutated.type).to.equal("MemberExpression");
  });
});
