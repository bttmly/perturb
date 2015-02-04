"use strict";

var expect = require("chai").expect;
var assign = require("object-assign");
var I = require("immutable");
var esprima = require("esprima");
var partial = require("lodash.partial");

var constants = require("../lib/constants");
var getMutatorForNode = require("../lib/mutators");

var NODE_TYPES = constants.NODE_TYPES;

var originalImmutableMapGet = I.Map.prototype.get;

I.Map.prototype.get = function () {
  var result = originalImmutableMapGet.apply(this, arguments);
  if (result == null) throw new Error("exit Attempted to access undefined property");
  return result;
};

function nodeFromCode (code) {
  var ast = esprima.parse(code);
  if (ast.body.length !== 1) throw new Error("More than one node created");
  return I.fromJS(ast.body[0]);
}

function makeNodeOfType (type, props) {
  if (!(type in NODE_TYPES)) throw new Error("Invalid node type.");
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

  describe("invertConditionalTest()", function () {
    it("inverts the test property of the node", function () {
      var arg = "someIdentifier";
      var node = makeNodeOfType("IfStatement", {
        test: arg
      });
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("invertConditionalTest");
      var test = mutator(node).get("test");
      expect(test.get("type")).to.equal("UnaryExpression");
      expect(test.get("operator")).to.equal("!");
      expect(test.get("argument")).to.equal(arg);
    });
  });

  describe("reverseFunctionParameters()", function () {
    it("reverses the order of a function's arguments", function () {
      var node = nodeFromCode("function func (a, b, c, d) {}");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("reverseFunctionParameters");
      var mutated = mutator(node);
      expect(mutated.get("type")).to.equal("FunctionDeclaration");
      expect(mutated.getIn(["id", "name"])).to.equal("func");
      expect(mutated.getIn(["params", "0", "name"])).to.equal("d");
      expect(mutated.getIn(["params", "1", "name"])).to.equal("c");
      expect(mutated.getIn(["params", "2", "name"])).to.equal("b");
      expect(mutated.getIn(["params", "3", "name"])).to.equal("a");
    });
  });

});


