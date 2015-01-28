"use strict";

var I = require("immutable");

var util = require("./util");
var constants = require("./constants");

var BANG = "!";
var VOID = "void";

var NODE_TYPES = constants.NODE_TYPES;
var JS_TYPES = constants.JS_TYPES;

var FUNC_NODES = util.mapMirror([
  NODE_TYPES.FunctionDeclaration,
  NODE_TYPES.FunctionExpression
]);

var NODES_WITH_TEST = util.mapMirror([
  NODE_TYPES.IfStatement,
  NODE_TYPES.WhileStatement,
  NODE_TYPES.DoWhileStatement,
  NODE_TYPES.ForStatement,
  NODE_TYPES.ConditionalExpression,
  NODE_TYPES.SwitchCase,
]);

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
    return Object.keys(typeish).toString();
  }
  return String(typeish);
}

function assertNodeType (node, type, test) {
  if (!I.Iterable.isKeyed(node)) {
    throw new Error("Node must be an Immutable.js keyed iterable");
  }
  var actualType = get(node, "type");
  if (!test(actualType, type)) {
    throw new Error([
      "Node is of wrong type. Actual:",
      actualType,
      "Expected: ",
      getString(type)
    ]);
  }
}

function assertNodeTypeIn (node, types) {
  assertNodeType(node, types, function (actual, map) {
    return actual in map;
  });
}

function assertNodeTypeIs (node, type) {
  assertNodeType(node, type, function (actual, map) {
    return actual === map;
  });
}

// consumers of this function may either want:
// 1. To know whether or not a given node WILL be mutated --OR--
// 2. The mutation function itself, for use

// In case 2. the node must be immutable, however for case 1. we
// accept a mutable or immutable node.
function getMutatorForNode (node) {

  var nodeType = get(node, "type");
  var config = global.__perturbConfig__ || {};

  switch (nodeType) {

  case undefined:
    // obviously not going to proceed
    return null;

  case NODE_TYPES.ArrayExpression:
    // skip trying to mutate an empty array literal
    if (size(get(node, "elements")) === 0) return null;
    if (config.ddae) return null;
    return mutators.dropArrayElement;

  case NODE_TYPES.ObjectExpression:
    // skip trying to mutate an empty object literal
    if (size(get(node, "properties")) === 0) return null;
    if (config.ddop) return null;
    return mutators.dropObjectProperty;

  case NODE_TYPES.Literal:
    // Literal nodes include RegExp literals as well as `null`
    // Skip them for now -- may be albe to mutate RegExp literals eventually
    if (typeof get(node, "value") === JS_TYPES.obj) return null;
    if (config.dtlv) return null;
    return mutators.tweakLiteralValue;

  case NODE_TYPES.BinaryExpression:
    // skip binary expressions for which no operator swap exists
    if (!(get(node, "operator") in BINARY_OPERATOR_SWAPS)) return null;
    if (config.dsbo) return null;
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

  case NODE_TYPES.AssignmentExpression:
    if (config.ddma) return null;
    return mutators.dropMemberAssignment;

  case FUNC_NODES[nodeType]:
    // skip function if it has 0 or 1 params, b/c can't reverse order
    if (size(get(node, "params")) < 2) return null;
    if (config.drfp) return null;
    return mutators.reverseFunctionParameters;

  case NODES_WITH_TEST[nodeType]:
    // skip nodes without a test (default in switch for example)
    if (!get(node, "test")) return null;
    if (config.dict) return null;
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
    return node.set("test", I.Map({
      type: NODE_TYPES.UnaryExpression,
      operator: BANG,
      argument: get(node, "test")
    }));
  },

  // reverse the perameter order for a function expression or declaration
  // `function fn (a, b)` {} => `function fn (b, a)`
  reverseFunctionParameters: function reverseFunctionParameters (node) {
    assertNodeTypeIn(node, FUNC_NODES);
    return node.set("params", node.get("params").reverse());
  },

  // drop return w/o affecting the rest of the expression/statement
  // if return statement has no argument, instead transform it into `void 0;`
  // `return something;` => `something;`
  // `return;` => `void 0;`
  dropReturn: function dropReturn (node) {
    assertNodeTypeIs(node, NODE_TYPES.ReturnStatement);
    var arg = get(node, "argument");

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
    return node.set("elements", node.get("elements").slice(1));
  },

  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  dropObjectProperty: function dropObjectProperty (node) {
    assertNodeTypeIs(node, NODE_TYPES.ObjectExpression);
    return node.set("properties", node.get("properties").slice(1));
  },

  // increments numbers, drops first character of strings, reverses booleans
  // `var MAGIC_NUM = 123` => `var MAGIC_NUM = 124`
  // `var name = 'Jack'` => `var name = 'ack'`
  // `var bool = true` => `var bool = false`
  tweakLiteralValue: function tweakLiteralValue (node) {
    assertNodeTypeIs(node, NODE_TYPES.Literal);

    var newVal;
    var value = get(node, "value");

    switch (typeof value) {

    case JS_TYPES.str:
      newVal = value.length ? value.slice(1) : "a";
      return node.merge({
        value: newVal,
        raw: '"' + newVal + '"'
      });

    case JS_TYPES.num:
      newVal = value >= 0 ? value + 1 : value - 1;
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

    default:
      return node;

    }
  },

  // This mutation is dangerous to apply in the current design
  // since it is exceptionally likely to cause unbounded loops,
  // so it's disabled right now
  //
  // flips increment/decrement operators
  // `i++` => `i--`
  // `j--` => `j++`
  invertIncDecOperators: function invertIncDecOperators (node) {
    assertNodeTypeIs(node, NODE_TYPES.UpdateExpression);

    var INC = "++";
    var DEC = "--";

    var prevOp = node.get("operator");
    var newOp = (prevOp === INC ? DEC : INC);

    return node.set("operator", newOp);
  },


  // swaps && for || and vice versa
  // `if (x && y)` => `if (x || y)`
  // `while (f() || g())` => `while(f() && g())`
  swapLogicalOperators: function swapLogicalOperators (node) {
    assertNodeTypeIs(node, NODE_TYPES.LogicalExpression); {
      var prevOp = node.get("operator");
      var newOp = prevOp === "&&" ? "||" : "&&";
      return node.set("operator", newOp);
    }
  },

  // swaps [+, -] and [*, /]
  // `age = age + 1;` => `age = age - 1;`
  // `var since = new Date() - start;` => `var since = new Date() + start;`
  // `var dy = rise / run;` => `var dy = rise * run;`
  // `var area = w * h;` => `var area = w / h;`
  swapBinaryOperators: function swapBinaryOperators (node) {
    assertNodeTypeIs(node, NODE_TYPES.BinaryExpression);
    var prevOp = node.get("operator");
    var newOp = BINARY_OPERATOR_SWAPS[prevOp];
    return node.set("operator", newOp);
  },

  // removes a unary operator, leaving just the operator's argument
  // `delete obj.prop;` => `obj.prop;`
  // `return !v;` => `return v;`
  dropUnaryOperator: function dropUnaryOperator (node) {
    assertNodeTypeIs(node, NODE_TYPES.UnaryExpression);
    return node.get("argument");
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
