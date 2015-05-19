var expect = require("chai").expect;

var mutators = require("../lib/mutators");

function isArrayOf (type) {
  return function (a) {
    if (!Array.isArray(a)) return false;
    return a.every(function (e) {
      return typeof e === type;
    });
  }
}

function isValidMutator (m) {
  if (typeof m.name !== "string") return false;
  if (typeof m.mutator !== "function") return false;

  if (Array.isArray(m.type)) {
    if (!isArrayOf("string")(m.type)) return false;
  } else {
    if (typeof m.type !== "string") return false;
  }

  if (Object.prototype.hasOwnProperty.call(m, "filter")) {
    if (typeof m.filter !== "function") return false;
  }
  return true;
}

describe("mutators", function () {
  it("all mutators are well formed", function () {
    expect(mutators.mutators.every(isValidMutator)).to.equal(true);
  });
});
