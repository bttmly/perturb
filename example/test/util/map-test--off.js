"use strict";

var assert = require("assert");

var map = require("../../lib/util/map");

function nums () {
  return [1, 2, 3, 4, 5, 6];
}

var doubles = [2, 4, 6, 8, 10, 12];

describe("maps", function () {

  var numArr;

  beforeEach(function () {
    numArr = nums();
  });

  describe("#likeEs5Map", function () {
    it("maps values into a new array", function () {
      var result = map.likeEs5Map(numArr, function (n) {
        return n * 2;
      });
      console.log(result);
      assert.deepEqual(result, doubles);
    });
  });

  describe("#likeLodashMap", function () {
    it("maps values into a new array", function () {
      var result = map.likeLodashMap(numArr, function (n) {
        return n * 2;
      });
      console.log(result);
      assert.deepEqual(result, doubles);
    });
  });

  console.log();

});