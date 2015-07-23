"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;

describe("dropReturn", function () {
  it("removes a return statement, leaving the argument", function () {
    var node = nodeFromCode("function id (x) { return x; }").getIn(["body", "body", 0]);
    expect(node.get("type")).to.equal("ReturnStatement");
    var m = mutatorByName("dropReturn");
    expect(node.get("argument")).to.be.truthy();
    var mutated = m.mutator(node);
    expect(mutated.getIn(["expression", "type"])).to.equal("Identifier");
    expect(mutated.getIn(["expression", "name"])).to.equal("x");
  });

  it("removes a return statement without an argument, replacing it with `void 0;`", function () {
    var node = nodeFromCode("function id (x) { return; }").getIn(["body", "body", 0]);
    expect(node.get("type")).to.equal("ReturnStatement");
    var m = mutatorByName("dropReturn");
    expect(node.get("argument")).to.not.be.truthy();
    var mutated = m.mutator(node);
    expect(mutated.get("type")).to.equal("UnaryExpression");
    expect(mutated.get("operator")).to.equal("void");
    expect(mutated.getIn(["argument", "type"])).to.equal("Literal");
    expect(mutated.getIn(["argument", "value"])).to.equal(0);
    expect(mutated.getIn(["argument", "raw"])).to.equal("0");
    expect(mutated.get("prefix")).to.equal(true);

  });
});
