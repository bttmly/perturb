"use strict";

var expect = require("chai").expect;

var mapMirror = require("../../src/util/map-mirror")

xdescribe("#mapMirror", function () {

  it("the result is frozen", function () {
    var result = mapMirror({});
    expect(Object.isFrozen(result)).to.equal(true);
  });

  describe("array input", function () {
    it("returns an object with each array member mirrored as key/value", function () {
      var arr = ["one", "two", "three"];
      var result = mapMirror(arr);
      expect(result).to.deep.equal({
        one: "one",
        two: "two",
        three: "three",
      });
    });

    it("throws an exception if a member isn't a string", function () {
      var arr = ["one", "two", 3];
      expect(function () {
        mapMirror(arr);
      }).to.throw("Accepts only strings");
    });

  });

  describe("object input", function () {
    it("returns an object with each object key mirrored as key/value", function () {
      var obj = {one: 1, two: 2, three: 3};
      var result = mapMirror(obj);
      expect(result).to.deep.equal({
        one: "one",
        two: "two",
        three: "three",
      });
    });
  });

});
