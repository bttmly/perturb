"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;

function get (p) {
  return function (o) {
    if (!Object.prototype.hasOwnProperty.call(o, p)) return undefined;
    return o[p];
  };
}

describe("reverseFunctionParameters", function () {
  it("reverses the order of a function's declaration's arguments", function () {
    var node = nodeFromCode("function func (a, b, c, d) {}");
    var m = mutatorByName("reverseFunctionParameters");
    var mutated = m.mutator(node);
    var paramNames = mutated.get("params").toJS().map(get("name"));
    expect(paramNames).to.eql(["d", "c", "b", "a"]);
  });

  it("reverses the order of a function's expression's arguments", function () {
    var node = nodeFromCode("(function (a, b, c) {})").get("expression");
    var m = mutatorByName("reverseFunctionParameters");
    var mutated = m.mutator(node);
    var paramNames = mutated.get("params").toJS().map(get("name"));
    expect(paramNames).to.eql(["c", "b", "a"]);
  });
});
