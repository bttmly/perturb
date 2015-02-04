"use strict";

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

function contains (arr, value) {
  return arr.indexOf(value) !== -1;
}

var mutatorToAllowedNodeTypeMap = {
  invertConditionalTest: Object.keys(constants.NODES_WITH_TEST),
  reverseFunctionParameters: Object.keys(constants.FUNC_NODES),
  dropReturn: [NODE_TYPES.ReturnStatement],
  dropArrayElement: [NODE_TYPES.ArrayExpression],
  dropObjectProperty: [NODE_TYPES.ObjectExpression],
  tweakLiteralValue: [NODE_TYPES.Literal],
  invertIncDecOperators: [NODE_TYPES.UpdateExpression],
  swapBinaryOperators: [NODE_TYPES.BinaryExpression],
  swapLogicalOperators: [NODE_TYPES.LogicalExpression],
  dropUnaryOperator: [NODE_TYPES.UnaryExpression],
  dropMemberAssignment: [NODE_TYPES.AssignmentExpression]
};

describe("getMutatorForNode()", function () {
  it("is a function", function () {
    expect(getMutatorForNode).to.be.a("function");
  });
});

describe("mutators", function () {

  var m;

  it("has a `mutators` property", function () {
    expect(getMutatorForNode).to.have.ownProperty("mutators");
    m = getMutatorForNode.mutators;
  });

  it("each mutator is a named function", function () {
    Object.keys(m).forEach(function (key) {
      expect(m[key]).to.be.instanceof(Function);
      expect(m[key].name).to.equal(key);
    });
  });

  it("each mutator throws if not passed an Immutable keyed iterable", function () {
    Object.keys(m).forEach(function (key) {
      expect(function () {
        m[key]({});
      }).to.throw(/^Node must be an Immutable\.js keyed iterable/);
    });
  });

  it("test method map matches actual method map", function () {
    expect(Object.keys(m).sort()).to.deep.equal(
      Object.keys(mutatorToAllowedNodeTypeMap).sort());
  });

  it("each mutator accepts only specified node types", function () {
    var map = mutatorToAllowedNodeTypeMap;
    var wrongTypeRe = /^Node is of wrong type\./;

    Object.keys(m).forEach(function (key) {
      Object.keys(constants.NODE_TYPES).forEach(function (type) {
        var node = makeNodeOfType(type);

        if (contains(map[key], type))
          return expect(function () {
            m[key](node);
          }).to.not.throw(wrongTypeRe);

        expect(function () {
          m[key](node);
        }).to.throw(wrongTypeRe);
      });
    });
  });

  xdescribe("invertConditionalTest()", function () {

  });

});


