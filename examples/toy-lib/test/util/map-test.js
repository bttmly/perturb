"use strict";

const assert = require("assert");

const map = require("../../lib/util/map");

function nums() {
  return [1, 2, 3, 4, 5, 6];
}

function timesTwo(n) {
  return n * 2;
}

const doubles = [2, 4, 6, 8, 10, 12];

describe("maps", function () {

  let numArr;

  beforeEach(function () {
    numArr = nums();
  });

  describe("#likeEs5Map", function () {
    it("maps values into a new array", function () {
      const result = map.likeEs5Map(numArr, timesTwo);
      assert.deepEqual(result, doubles);
    });
  });

  describe("#likeLodashMap", function () {
    it("maps values into a new array", function () {
      const result = map.likeLodashMap(numArr, timesTwo);
      assert.deepEqual(result, doubles);
    });

    it("runs on arrays with empty slots", () => {
      const result = map.likeLodashMap(new Array(3), () => 1)
      assert.deepEqual(result, [1, 1, 1]);
    })
  });

});