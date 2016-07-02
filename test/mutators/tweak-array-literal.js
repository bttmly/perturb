"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;

describe("tweakArrayLiteral", function () {
  it("removes the first element of an array literal", function () {
    var node = nodeFromCode("[1, 2, 3]").expression;
    expect(node.type).to.equal("ArrayExpression");
    var m = mutatorByName("tweakArrayLiteral");
    var mutated = m.mutator(node);
    expect(mutated.elements.length).to.equal(2);
    expect(mutated.elements[0].value).to.equal(2);
    expect(mutated.elements[1].value).to.equal(3);
  });
});
