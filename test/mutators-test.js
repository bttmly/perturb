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

function nodeFromCode (code) {
  var ast = esprima.parse(code);
  if (ast.body.length !== 1) {
    throw new Error("More than one node created", JSON.stringify(ast.body));
  }
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
  // invertIncDecOperators: [NODE_TYPES.UpdateExpression],
  swapBinaryOperators: [NODE_TYPES.BinaryExpression],
  swapLogicalOperators: [NODE_TYPES.LogicalExpression],
  dropUnaryOperator: [NODE_TYPES.UnaryExpression],
  dropMemberAssignment: [NODE_TYPES.AssignmentExpression]
};

var nodesThatGetMutators = Object.keys(mutatorToAllowedNodeTypeMap).reduce(function (map, key) {
  mutatorToAllowedNodeTypeMap[key].forEach(function (name) {
    map[name] = true;
  });
  return map;
}, {});

// before(function () {
//   I.Map.prototype.get = function () {
//     var result = originalImmutableMapGet.apply(this, arguments);
//     console.log(result);
//     if (result === undefined) throw new Error("exit Attempted to access undefined property");
//     return result;
//   };
// });

// after(function () {
//   I.Map.prototype.get = originalImmutableMapGet;
// });

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

    it("reverses the order of a function's arguments", function () {
      var node = nodeFromCode("function func (a, b, c) {}");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("reverseFunctionParameters");
      var mutated = mutator(node);
      expect(mutated.get("type")).to.equal("FunctionDeclaration");
      expect(mutated.getIn(["id", "name"])).to.equal("func");
      expect(mutated.getIn(["params", "0", "name"])).to.equal("c");
      expect(mutated.getIn(["params", "1", "name"])).to.equal("b");
      expect(mutated.getIn(["params", "2", "name"])).to.equal("a");
    });
  });

  describe("dropReturn()", function () {
    it("removes a return statement, leaving the argument", function () {
      var node = nodeFromCode("function id (x) { return x; }").getIn(["body", "body", 0]);
      expect(node.get("type")).to.equal("ReturnStatement");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("dropReturn");
      expect(node.get("argument")).to.be.ok();
      var mutated = mutator(node);
      expect(mutated.getIn(["expression", "type"])).to.equal("Identifier");
      expect(mutated.getIn(["expression", "name"])).to.equal("x");
    });

    it("removes a return statement without an argument, replacing it with `void 0;`", function () {
      var node = nodeFromCode("function id (x) { return; }").getIn(["body", "body", 0]);
      expect(node.get("type")).to.equal("ReturnStatement");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("dropReturn");
      expect(node.get("argument")).to.not.be.ok();
      var mutated = mutator(node);
      expect(mutated.get("type")).to.equal("UnaryExpression");
      expect(mutated.get("operator")).to.equal("void");
      expect(mutated.getIn(["argument", "type"])).to.equal("Literal");
      expect(mutated.getIn(["argument", "value"])).to.equal(0);
      expect(mutated.getIn(["argument", "raw"])).to.equal("0");
      expect(mutated.get("prefix")).to.equal(true);

    });
  });

  describe("dropArrayElement()", function () {
    it("removes the first element of an array literal", function () {
      var node = nodeFromCode("[1, 2, 3]").get("expression");
      expect(node.get("type")).to.equal("ArrayExpression");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("dropArrayElement");
      var mutated = mutator(node);
      expect(mutated.get("elements").size).to.equal(2);
      expect(mutated.get("elements").last().get("value")).to.equal(3);
    });
  });

  describe("dropObjectProperty()", function () {
    it("removes the first property of an object literal", function () {
      var node = nodeFromCode("x = {a: 1, b: 2, c: 3}").getIn(["expression", "right"]);
      expect(node.get("type")).to.equal("ObjectExpression");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("dropObjectProperty");
      var mutated = mutator(node);
      expect(mutated.get("properties").size).to.equal(2);
      expect(mutated.get("properties").last().getIn(["key", "name"])).to.equal("c");
      expect(mutated.get("properties").last().getIn(["value", "value"])).to.equal(3);
    });
  });

  describe("swapLogicalOperators()", function () {
    it("changes `&&` to `||`", function () {
      var node = nodeFromCode("x && y;").get("expression");
      expect(node.get("type")).to.equal("LogicalExpression");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("swapLogicalOperators");
      var mutated = mutator(node);
      expect(mutated.get("operator")).to.equal("||");
    });

    it("changes `||` to `&&`", function () {
      var node = nodeFromCode("x || y;").get("expression");
      expect(node.get("type")).to.equal("LogicalExpression");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("swapLogicalOperators");
      var mutated = mutator(node);
      expect(mutated.get("operator")).to.equal("&&");
    });
  });

  describe("dropUnaryOperator()", function () {
    ["-", "+", "!", "~", "typeof ", "void ", "delete "].forEach(function (operator) {
      it("removes the " + operator + "operator", function () {
        var node = nodeFromCode(operator + "x;").get("expression");
        expect(node.get("type")).to.equal("UnaryExpression");
        var mutator = getMutatorForNode(node);
        expect(mutator.name).to.equal("dropUnaryOperator");
        var mutated = mutator(node);
        expect(mutated.get("type")).to.equal("Identifier");
        expect(mutated.get("name")).to.equal("x");
      });
    });
  });

  describe("swapBinaryOperators()", function () {
    var swaps = [
      ["+", "-"],
      ["-", "+"],
      ["*", "/"],
      ["/", "*"],
      [">", "<="],
      ["<=", ">"],
      ["<", ">="],
      [">=", "<"],
      ["==", "!="],
      ["!=", "=="],
      ["===", "!=="],
      ["!==", "==="]
    ];
    swaps.forEach(function (operatorPair) {
      var originalOp = operatorPair[0];
      var newOp = operatorPair[1];
      it(["changes", originalOp, "to", newOp].join(" "), function () {
        var node = nodeFromCode([1, originalOp, 2].join(" ")).get("expression");
        var mutator = getMutatorForNode(node);
        expect(mutator.name).to.equal("swapBinaryOperators");
        var mutated = mutator(node);
        expect(mutated.get("operator")).to.equal(newOp);
      })
    });

  });

  describe("dropMemberAssignment()", function () {
    it("drops a member assignment", function () {
      var node = nodeFromCode("global.count = 100;").get("expression");
      expect(node.get("type")).to.equal("AssignmentExpression");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("dropMemberAssignment");
      var mutated = mutator(node);
      expect(mutated.get("type")).to.equal("MemberExpression");
    });
  });

  describe("tweakLiteralValue()", function () {
    it("alters NON-EMPTY string literals by lopping off the last character", function () {
      var node = nodeFromCode("'hello';").get("expression");
      expect(node.get("value")).to.equal("hello");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("tweakLiteralValue");
      var mutated = mutator(node);
      expect(mutated.get("value")).to.equal("ello");
      expect(mutated.get("raw")).to.equal('"ello"');
    });

    it("alters EMPTY string literals by replacing them with 'a'", function () {
      var node = nodeFromCode("'';").get("expression");
      expect(node.get("value")).to.equal("");
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("tweakLiteralValue");
      var mutated = mutator(node);
      expect(mutated.get("value")).to.equal("a");
      expect(mutated.get("raw")).to.equal('"a"');
    });

    it("alters number literals by adding 1", function () {
      var node = nodeFromCode("123;").get("expression");
      expect(node.get("value")).to.equal(123);
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("tweakLiteralValue");
      var mutated = mutator(node);
      expect(mutated.get("value")).to.equal(124);
      expect(mutated.get("raw")).to.equal("124");
    });

    it("alters `true` literals by replacing with `false`", function () {
      var node = nodeFromCode("true;").get("expression");
      expect(node.get("value")).to.equal(true);
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("tweakLiteralValue");
      var mutated = mutator(node);
      expect(mutated.get("value")).to.equal(false);
      expect(mutated.get("raw")).to.equal("false");
    });

    it("alters `false` literals by replacing with `true`", function () {
      var node = nodeFromCode("false;").get("expression");
      expect(node.get("value")).to.equal(false);
      var mutator = getMutatorForNode(node);
      expect(mutator.name).to.equal("tweakLiteralValue");
      var mutated = mutator(node);
      expect(mutated.get("value")).to.equal(true);
      expect(mutated.get("raw")).to.equal("true");
    });

  });

  describe("getMutatorForNode() in exceptional cases", function () {

    it("returns null for a node with undefined type (although this shouldn't be happening)", function () {
      var node = I.fromJS({ type: undefined });
      expect(getMutatorForNode(node)).to.equal(null);
    });

    Object.keys(NODE_TYPES).forEach(function (type) {
      if (nodesThatGetMutators[type]) return;
      it("returns null for nodes of type " + type, function () {
        var node = makeNodeOfType(type);
        expect(getMutatorForNode(node)).to.equal(null);
      });
    });

    it("returns null for an empty array literal", function () {
      var node = nodeFromCode("[];").get("expression");
      expect(node.get("type")).to.equal("ArrayExpression");
      expect(getMutatorForNode(node)).to.equal(null);
    });

    it("returns null for an empty object literal", function () {
      var node = nodeFromCode("({});").get("expression");
      expect(node.get("type")).to.equal("ObjectExpression");
      expect(getMutatorForNode(node)).to.equal(null);
    });

    it("returns null for a regular expression literal", function () {
      var node = nodeFromCode("/hello/;").get("expression");
      expect(node.get("type")).to.equal("Literal");
      expect(getMutatorForNode(node)).to.equal(null);
    });

    var NO_SWAP_OPS = ["<<", ">>", ">>>","%", "|", "^", "&", "in", "instanceof", /* ".." */];
    NO_SWAP_OPS.forEach(function (op) {
      it("returns null for binary operation with " + op, function () {
        var node = nodeFromCode([5, op, 10, ";"].join(" ")).get("expression");
        expect(node.get("type")).to.equal("BinaryExpression");
        expect(getMutatorForNode(node)).to.equal(null);
      });
    });

    it("returns null for a function with no arguments", function () {
      var node = nodeFromCode("function fn () {}");
      expect(node.get("type")).to.equal("FunctionDeclaration");
      expect(getMutatorForNode(node)).to.equal(null);
    });

    it("returns null for a function with one argument", function () {
      var node = nodeFromCode("function fn (x) {}");
      expect(node.get("type")).to.equal("FunctionDeclaration");
      expect(getMutatorForNode(node)).to.equal(null);
    });

    it("returns null for a function with one argument", function () {
      var node = nodeFromCode("function fn (x) {}");
      expect(node.get("type")).to.equal("FunctionDeclaration");
      expect(getMutatorForNode(node)).to.equal(null);
    });

    it("returns null for nodes where test is null", function () {
      var node = nodeFromCode("switch (x) { default: }").getIn(["cases", "0"]);
      expect(node.get("type")).to.equal("SwitchCase");
      expect(getMutatorForNode(node)).to.equal(null);
    });
  });

  describe("config flags", function () {
    var FLAG_TO_TYPE_MAP = {
      ddae: [NODE_TYPES.ArrayExpression],
      ddop: [NODE_TYPES.ObjectExpression],
      dtlv: [NODE_TYPES.Literal],
      dsbo: [NODE_TYPES.BinaryExpression],
      dduo: [NODE_TYPES.UnaryExpression],
      dslo: [NODE_TYPES.LogicalExpression],
      ddr: [NODE_TYPES.ReturnStatement],
      ddma: [NODE_TYPES.AssignmentExpression],
      dict: Object.keys(constants.NODES_WITH_TEST),
      drfp: Object.keys(constants.FUNC_NODES)
    };

    beforeEach(function () {
      global.__perturbConfig__ = {};
    });

    afterEach(function () {
      delete global.__perturbConfig__;
    });

    Object.keys(FLAG_TO_TYPE_MAP).forEach(function (flag) {
      var types = FLAG_TO_TYPE_MAP[flag];
      types.forEach(function (type) {
        it("the `" + flag + "` flag skips " + type, function () {
          global.__perturbConfig__[flag] = true;
          var node = makeNodeOfType(type)
            .set("operator", "+")
            .set("test", true);
          expect(getMutatorForNode(node)).to.equal(null);
        });
      });

    });

  });

});




