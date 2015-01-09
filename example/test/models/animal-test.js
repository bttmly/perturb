// animal model test
var assert = require("assert");

var Animal = require("../../lib/models/animal");

describe("Animal", function () {

  it("Should not throw an error", function () {
    var a = new Animal();
  });

  it("Should instantiate correctly", function () {
    var a = new Animal(4, "brown");
    // assert(a.numLegs === 4);
    // assert(a.color === "brown");
    // assert(a.isBrown === true);
    // assert(a.kittens === 2);
  });

});