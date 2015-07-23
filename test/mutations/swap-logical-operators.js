"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;

describe("swapLogicalOperators", function () {
  it("changes `&&` to `||`", function () {
    var node = nodeFromCode("x && y;").get("expression");
    expect(node.get("type")).to.equal("LogicalExpression");
    var m = mutatorByName("swapLogicalOperators");
    var mutated = m.mutator(node);
    expect(mutated.get("operator")).to.equal("||");
  });

  it("changes `||` to `&&`", function () {
    var node = nodeFromCode("x || y;").get("expression");
    expect(node.get("type")).to.equal("LogicalExpression");
    var m = mutatorByName("swapLogicalOperators");
    var mutated = m.mutator(node);
    expect(mutated.get("operator")).to.equal("&&");
  });
});
