"use strict";

var assert = require("assert");

var Vehicle = require("../../lib/models/vehicle");

describe("Vehicle", function () {

  var v;

  beforeEach(function () {
    v = new Vehicle();
  });

  it("is a function", function () {
    assert(typeof Vehicle === "function");
  });

  it("new vehicles have position of `0`", function () {
    assert(v.position === 0);
  });

  it("vehicles have speed of `5` (in prototype)", function () {
    assert(v.speed === 5);
  });

  it("vehicles have maxPassengers of `2` (in prototype)", function () {
    assert.equal(v.maxOccupants, 2);
    assert.equal(v.hasOwnProperty("maxOccupants"), false);
  });

  it("vehicles can be boarded by occupants", function () {
    v.board("abc");
    assert.equal(v.occupants.length, 1);
    assert.equal(v.occupants[0], "abc");
  });

});