var expect = require("chai").expect;

var getMutatorForNode = require("../lib/mutators");

describe("exported function", function () {
  it("exports a function", function () {
    // console.log(Object.keys(getMutatorForNode));
    expect(getMutatorForNode).to.be.a("function");
  });
});