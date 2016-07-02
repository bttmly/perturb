"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var makeNodeOfType = helpers.makeNodeOfType;

describe("invertConditionalTest()", function () {
  it("inverts the test property of the node", function () {
    var arg = "someIdentifier";
    var node = makeNodeOfType("IfStatement", {test: arg});
    var m = mutatorByName("invertConditionalTest");
    var test = m.mutator(node).test
    expect(test.type).to.equal("UnaryExpression");
    expect(test.operator).to.equal("!");
    expect(test.argument).to.equal(arg);
  });
});
