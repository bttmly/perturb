"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;

describe("dropReturn", function () {
  it("removes a return statement, leaving the argument", function () {
    var node = nodeFromCode("function id (x) { return x; }").body.body[0];
    expect(node.type).to.equal("ReturnStatement");
    var m = mutatorByName("dropReturn");
    expect(node.argument).to.be.truthy();
    var mutated = m.mutator(node);
    expect(mutated.expression.type).to.equal("Identifier");
    expect(mutated.expression.name).to.equal("x");
  });

  it("removes a return statement without an argument, replacing it with `void 0;`", function () {
    var node = nodeFromCode("function id (x) { return; }").body.body[0];
    expect(node.type).to.equal("ReturnStatement");
    var m = mutatorByName("dropReturn");
    expect(node.argument).to.not.be.truthy();
    var mutated = m.mutator(node);
    expect(mutated.type).to.equal("UnaryExpression");
    expect(mutated.operator).to.equal("void");
    expect(mutated.argument.type).to.equal("Literal");
    expect(mutated.argument.value).to.equal(0);
    expect(mutated.prefix).to.equal(true);
  });
});
