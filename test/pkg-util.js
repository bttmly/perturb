"use strict";

var expect = require("chai").expect;

var util = require("../lib/pkg-util");


describe("#mapMirror", function () {

  it("the result is frozen", function () {
    var result = util.mapMirror({});
    expect(Object.isFrozen(result)).to.equal(true);
  });

  describe("array input", function () {
    it("returns an object with each array member mirrored as key/value", function () {
      var arr = ["one", "two", "three"];
      var result = util.mapMirror(arr);
      expect(result).to.deep.equal({
        one: "one",
        two: "two",
        three: "three"
      });
    });

    it("throws an exception if a member isn't a string", function () {
      var arr = ["one", "two", 3];
      expect(function () {
        util.mapMirror(arr);
      }).to.throw("Needs a string");
    });

  });

  describe("object input", function () {
    it("returns an object with each object key mirrored as key/value", function () {
      var obj = {one: 1, two: 2, three: 3};
      var result = util.mapMirror(obj);
      expect(result).to.deep.equal({
        one: "one",
        two: "two",
        three: "three"
      });
    });
  });

});

// describe("#constObj", function () {

// });


describe("#mutantIsDead", function () {
  it("just returns the boolean cast of the input's `failed` property", function () {
    expect(util.mutantIsDead({failed: 0})).to.equal(false);
    expect(util.mutantIsDead({failed: 1})).to.equal(true);
  });
});

describe("#mutantIsAlive", function () {
  it("passedCount is truthy and not failed", function () {
    expect(util.mutantIsAlive({passedCount: 0, failed: true})).to.equal(false);
    expect(util.mutantIsAlive({passedCount: 0, failed: false})).to.equal(false);
    expect(util.mutantIsAlive({passedCount: 1, failed: true})).to.equal(false);
    expect(util.mutantIsAlive({passedCount: 1, failed: false})).to.equal(true);
  });
});
