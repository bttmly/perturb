"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;

describe("swapLogicalOperators", function () {
  it("changes `&&` to `||`", function () {
    var node = nodeFromCode("x && y;").expression;
    expect(node.type).to.equal("LogicalExpression");
    var m = mutatorByName("swapLogicalOperators");
    var mutated = m.mutator(node);
    expect(mutated.operator).to.equal("||");
  });

  it("changes `||` to `&&`", function () {
    var node = nodeFromCode("x || y;").expression;
    expect(node.type).to.equal("LogicalExpression");
    var m = mutatorByName("swapLogicalOperators");
    var mutated = m.mutator(node);
    expect(mutated.operator).to.equal("&&");
  });
});
