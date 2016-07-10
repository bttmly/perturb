const expect = require("expect");
const helpers = require("../helpers");
const mutatorByName = helpers.mutatorByName;
const nodeFromCode = helpers.nodeFromCode;
const BINARY_OPERATOR_SWAPS = require("../../built/constants/binary-operator-swaps.js");

describe("swap-binary-operators", function () {

  const m = mutatorByName("swap-binary-operators");

  Object.keys(BINARY_OPERATOR_SWAPS).forEach(function (originalOp) {
    const newOp = BINARY_OPERATOR_SWAPS[originalOp];
    it(["swaps", originalOp, "out for", newOp].join(" "), function () {
      const node = nodeFromCode([1, originalOp, 2].join(" ")).expression;
      const mutated = m.mutator(node);
      expect(mutated.operator).toEqual(newOp);
    });
  });

});
