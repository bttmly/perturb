var expect = require("chai").expect;
var assign = require("object-assign");
var I = require("immutable");
var partial = require("lodash.partial");

var constants = require("../lib/constants");
var getMutatorForNode = require("../lib/mutators");

var NODE_TYPES = constants.NODE_TYPES;

function makeNodeOfType (type, props) {
  props = props || {};
  return I.Map(assign({
    type: type
  }, props));
}

function chooseNodeTypeExcept (except) {
  var keys = Object.keys(NODE_TYPES);
  var i = keys.length;
}

describe("getMutatorForNode()", function () {
  it("is a function", function () {
    expect(getMutatorForNode).to.be.a("function");
  });
});

describe("mutators", function () {
  var m = getMutatorForNode.mutators;

  it("has a `mutators` property", function () {
    expect(getMutatorForNode).to.have.ownProperty("mutators");
  });

  it("each mutator is a named function", function () {
    Object.keys(m).forEach(function (key) {
      expect(m[key]).to.be.instanceof(Function);
      expect(m[key].name).to.equal(key);
    });
  });

  describe("invertConditionalTest()", function () {
    it("throws when passed a wrong node", function () {
      var node = makeNodeOfType(NODE_TYPES.AssignmentExpression);
      expect(partial(m.invertConditionalTest, node)).to.throw();
    });
    xit()

  });

});


