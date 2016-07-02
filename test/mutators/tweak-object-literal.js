"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;

describe("tweakObjectLiteral", function () {
  it("removes the first property of an object literal", function () {
    var node = nodeFromCode("x = {a: 1, b: 2, c: 3}").expression.right;
    expect(node.type).to.equal("ObjectExpression");
    var m = mutatorByName("tweakObjectLiteral");
    var mutated = m.mutator(node);
    expect(mutated.properties.length).to.equal(2);
    expect(mutated.properties[0].key.name).to.equal("b");
    expect(mutated.properties[1].key.name).to.equal("c");
    expect(mutated.properties[0].value.value).to.equal(2);
    expect(mutated.properties[1].value.value).to.equal(3);
  });
});
