var assert = require("assert");

var Vehicle = require("../../lib/models/vehicle");

describe("Vehicle", function () {
  it("is a function", function () {
    assert(typeof Vehicle === "function");
  });

  it("new vehicles have position of `0`", function () {
    var v = new Vehicle();
    assert(v.position === 0);
  });

  it("vehicles have speed of `5` (in prototype)", function () {
    var v = new Vehicle();
    assert(v.speed === 5);
  });

  it("vehicles have maxPassengers of `2` (in prototype)", function () {
    
  });

});