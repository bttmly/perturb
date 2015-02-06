"use strict";

var I = require("immutable");

var util = require("./util");
var constants = require("./constants");

var BANG = "!";
var VOID = "void";
var AND = "&&";
var OR = "||";

var NODE_TYPES = constants.NODE_TYPES;
var JS_TYPES = constants.JS_TYPES;
var FUNC_NODES = constants.FUNC_NODES;
var NODES_WITH_TEST = constants.NODES_WITH_TEST;

var BINARY_OPERATOR_SWAPS = util.constObj(
  [
    ["+", "-"],
    ["*", "/"],
    [">", "<="],
    ["<", ">="],
    ["==", "!="],
    ["===", "!=="]
  ].reduce(function (obj, tuple) {
    obj[tuple[0]] = tuple[1];
    obj[tuple[1]] = tuple[0];
    return obj;
  }, {})
);

var NODE_ATTRS = util.mapMirror([
  "operator",
  "elements",
  "properties",
  "value",
  "type",
  "test",
  "argument",
  "params"
]);

var mutators;

// for working agnostically with immutable/mutable AST
function get (obj, prop) {
  if (typeof obj.get === JS_TYPES.func) {
    return obj.get(prop);
  }
  return obj[prop];
}

// for working agnostically with immutable/mutable AST
function size (obj) {
  if (typeof obj.size === JS_TYPES.num) {
    return obj.size;
  }
  return obj.length;
}

function getString (typeish) {
  if (Object(typeish) === typeish) {
    return Object.keys(typeish).join(", ");
  }
  return String(typeish);
}

function assertNodeTypeOk (node, type, test, name) {
  if (!I.Iterable.isKeyed(node)) {
    throw new Error("Node must be an Immutable.js keyed iterable");
  }
  var actualType = get(node, NODE_ATTRS.type);
  if (!test(actualType, type)) {
    throw new Error([
      "Node is of wrong type. Actual: " +
      actualType +
      "\nExpected: " +
      getString(type)
    ]);
  }
}

function assertNodeTypeIn (node, types) {
  assertNodeTypeOk(node, types, function (actual, map) {
    return actual in map;
  });
}

function assertNodeTypeIs (node, type) {
  assertNodeTypeOk(node, type, function (actual, expected) {
    return actual === expected;
  });
}

// consumers of this function may either want:
// 1. To know whether or not a given node WILL be mutated --OR--
// 2. The mutation function itself, for use

// In case 2. the node must be immutable, however for case 1. we
// accept a mutable or immutable node.
function getMutatorForNode (node) {

  var nodeType = get(node, NODE_ATTRS.type);
  var config = global.__perturbConfig__ || {};

  switch (nodeType) {

  case undefined:
    // obviously not going to proceed
    return null;

  case NODE_TYPES.ArrayExpression:
    if (config.ddae) return null;
    // skip trying to mutate an empty array literal
    if (size(get(node, NODE_ATTRS.elements)) === 0) return null;
    return mutators.dropArrayElement;

  case NODE_TYPES.ObjectExpression:
    if (config.ddop) return null;
    // skip trying to mutate an empty object literal
    if (size(get(node, NODE_ATTRS.properties)) === 0) return null;
    return mutators.dropObjectProperty;

  case NODE_TYPES.Literal:
    if (config.dtlv) return null;
    // Literal nodes include RegExp literals as well as `null`
    // Skip them for now -- may be albe to mutate RegExp literals eventually
    if (typeof get(node, NODE_ATTRS.value) === JS_TYPES.obj) return null;
    return mutators.tweakLiteralValue;

  case NODE_TYPES.BinaryExpression:
    if (config.dsbo) return null;
    // skip binary expressions for which no operator swap exists
    if (!(get(node, NODE_ATTRS.operator) in BINARY_OPERATOR_SWAPS)) return null;
    return mutators.swapBinaryOperators;

  case NODE_TYPES.UnaryExpression:
    if (config.dduo) return null;
    return mutators.dropUnaryOperator;

  case NODE_TYPES.LogicalExpression:
    if (config.dslo) return null;
    return mutators.swapLogicalOperators;

  case NODE_TYPES.ReturnStatement:
    if (config.ddr) return null;
    return mutators.dropReturn;

  // Are there AssignmentExpressions besides those that contain a
  // MemberExpression?
  case NODE_TYPES.AssignmentExpression:
    if (config.ddma) return null;
    return mutators.dropMemberAssignment;

  case FUNC_NODES[nodeType]:
    if (config.drfp) return null;
    // skip function if it has 0 or 1 params, b/c can't reverse order
    if (size(get(node, NODE_ATTRS.params)) < 2) return null;
    return mutators.reverseFunctionParameters;

  case NODES_WITH_TEST[nodeType]:
    if (config.dict) return null;
    // skip nodes without a test (default in switch for example)
    if (!get(node, NODE_ATTRS.test)) return null;
    return mutators.invertConditionalTest;
  }

  return null;

}


// mutators receive an IMMUTABLE NODE and return an IMMUTABLE NODE
mutators = util.constObj({

  // inverts a conditional test with a bang
  // `if (isReady) {}` => `if (!(isReady)) {}`
  // `while (arr.length) {} => `while(!(arr.length)) {}`
  // `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
  //
  // used for all nodes in NODES_WITH_TEST
  invertConditionalTest: function invertConditionalTest (node) {
    assertNodeTypeIn(node, NODES_WITH_TEST);
    return node.set(NODE_ATTRS.test, I.Map({
      type: NODE_TYPES.UnaryExpression,
      operator: BANG,
      argument: get(node, NODE_ATTRS.test)
    }));
  },

  // reverse the perameter order for a function expression or declaration
  // `function fn (a, b)` {} => `function fn (b, a)`
  reverseFunctionParameters: function reverseFunctionParameters (node) {
    assertNodeTypeIn(node, FUNC_NODES);
    return node.set(NODE_ATTRS.params, node.get(NODE_ATTRS.params).reverse());
  },

  // drop return w/o affecting the rest of the expression/statement
  // if return statement has no argument, instead transform it into `void 0;`
  // `return something;` => `something;`
  // `return;` => `void 0;`
  dropReturn: function dropReturn (node) {
    assertNodeTypeIs(node, NODE_TYPES.ReturnStatement);
    var arg = get(node, NODE_ATTRS.argument);

    if (arg) {
      return I.Map({
        type: NODE_TYPES.ExpressionStatement,
        expression: arg
      });
    }

    return I.fromJS({
      type: NODE_TYPES.UnaryExpression,
      operator: VOID,
      argument: {
        type: NODE_TYPES.Literal,
        value: 0,
        raw: "0"
      },
      prefix: true
    });
  },

  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  dropArrayElement: function dropArrayElement (node) {
    assertNodeTypeIs(node, NODE_TYPES.ArrayExpression);
    return node.set(NODE_ATTRS.elements, node.get(NODE_ATTRS.elements).slice(1));
  },

  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  dropObjectProperty: function dropObjectProperty (node) {
    assertNodeTypeIs(node, NODE_TYPES.ObjectExpression);
    return node.set(NODE_ATTRS.properties, node.get(NODE_ATTRS.properties).slice(1));
  },

  // increments numbers, drops first character of strings, reverses booleans
  // `var MAGIC_NUM = 123` => `var MAGIC_NUM = 124`
  // `var name = 'Jack'` => `var name = 'ack'`
  // `var bool = true` => `var bool = false`
  tweakLiteralValue: function tweakLiteralValue (node) {
    assertNodeTypeIs(node, NODE_TYPES.Literal);

    var newVal;
    var value = get(node, NODE_ATTRS.value);

    switch (typeof value) {

    case JS_TYPES.str:
      newVal = value.length ? value.slice(1) : "a";
      return node.merge({
        value: newVal,
        raw: '"' + newVal + '"'
      });

    case JS_TYPES.num:
      // no such thing as a negative number literal
      // newVal = value >= 0 ? value + 1 : value - 1;
      newVal = value + 1;
      return node.merge({
        value: newVal,
        raw: String(newVal)
      });

    case JS_TYPES.bool:
      newVal = !value;
      return node.merge({
        value: newVal,
        raw: String(newVal)
      });
    }

    return node;
  },

  // This mutation is dangerous to apply in the current design
  // since it is exceptionally likely to cause unbounded loops,
  // so it's disabled right now
  //
  // flips increment/decrement operators
  // `i++` => `i--`
  // `j--` => `j++`

  // invertIncDecOperators: function invertIncDecOperators (node) {
  //   assertNodeTypeIs(node, NODE_TYPES.UpdateExpression);

  //   var INC = "++";
  //   var DEC = "--";

  //   var prevOp = node.get(NODE_ATTRS.operator);
  //   var newOp = (prevOp === INC ? DEC : INC);

  //   return node.set(NODE_ATTRS.operator, newOp);
  // },


  // swaps && for || and vice versa
  // `if (x && y)` => `if (x || y)`
  // `while (f() || g())` => `while(f() && g())`
  swapLogicalOperators: function swapLogicalOperators (node) {
    assertNodeTypeIs(node, NODE_TYPES.LogicalExpression); {
      var prevOp = node.get(NODE_ATTRS.operator);
      var newOp = (prevOp === AND ? OR : AND);
      return node.set(NODE_ATTRS.operator, newOp);
    }
  },

  // swaps [+, -] and [*, /]
  // `age = age + 1;` => `age = age - 1;`
  // `var since = new Date() - start;` => `var since = new Date() + start;`
  // `var dy = rise / run;` => `var dy = rise * run;`
  // `var area = w * h;` => `var area = w / h;`
  swapBinaryOperators: function swapBinaryOperators (node) {
    assertNodeTypeIs(node, NODE_TYPES.BinaryExpression);
    var prevOp = node.get(NODE_ATTRS.operator);
    var newOp = BINARY_OPERATOR_SWAPS[prevOp];
    return node.set(NODE_ATTRS.operator, newOp);
  },

  // removes a unary operator, leaving just the operator's argument
  // `delete obj.prop;` => `obj.prop;`
  // `return !v;` => `return v;`
  dropUnaryOperator: function dropUnaryOperator (node) {
    assertNodeTypeIs(node, NODE_TYPES.UnaryExpression);
    return node.get(NODE_ATTRS.argument);
  },

  // drops a member assignment
  // `obj.prop = 'value';` => `obj.prop;`
  dropMemberAssignment: function dropMemberAssignment (node) {
    assertNodeTypeIs(node, NODE_TYPES.AssignmentExpression);
    return node.get("left");
  }

});

getMutatorForNode.mutators = mutators;
module.exports = getMutatorForNode;


getMutatorForNode.danglingProperty = "asdf";
