"use strict";

var expect = require("must");
var helpers = require("../helpers");
var mutatorByName = helpers.mutatorByName;
var nodeFromCode = helpers.nodeFromCode;
var BINARY_OPERATOR_SWAPS = require("../../lib/constant/binary-operator-swaps.js");

describe("swapBinaryOperators", function () {

  var m = mutatorByName("swapBinaryOperators");

  Object.keys(BINARY_OPERATOR_SWAPS).forEach(function (originalOp) {
    var newOp = BINARY_OPERATOR_SWAPS[originalOp];
    it(["swaps", originalOp, "out for", newOp].join(" "), function () {
      var node = nodeFromCode([1, originalOp, 2].join(" ")).get("expression");
      var mutated = m.mutator(node);
      expect(mutated.get("operator")).to.equal(newOp);
    });
  });

});
