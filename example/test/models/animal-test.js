// animal model test

var Animal = require("../../lib/models/animal");

describe("Animal", function () {

  it("Should not throw an error", function () {
    var a = new Animal();
  });

});