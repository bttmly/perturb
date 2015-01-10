"use strict";

var assign = require("object-assign");
var I = require("immutable");

var util = require("./util");

var BANG = "!";
var ARRAY_EXPRESSION = "ArrayExpression";
var OBJECT_EXPRESSION = "ObjectExpression";
var FUNCTION_EXPRESSION = "FunctionExpression";
var FUNCTION_DECLARATION = "FunctionDeclaration";
var EXPRESSION_STATEMENT = "ExpressionStatement";
var BINARY_EXPRESSION = "BinaryExpression";
var UNARY_EXPRESSION = "UnaryExpression";
var UPDATE_EXPRESSION = "UpdateExpression";
var RETURN_STATEMENT = "ReturnStatement";
var LITERAL = "Literal";

var FUNC_NODES = util.constObj({
  FunctionDeclaration: 1,
  FunctionExpression: 1
});

var NODES_WITH_TEST = util.constObj({
  IfStatement: 1,
  WhileStatement: 1,
  DoWhileStatement: 1,
  ForStatement: 1,
  ConditionalExpression: 1,
  SwitchCase: 1
});

var TYPES = util.constObj({
  FUNC: "function",
  BOOL: "boolean",
  STR: "string",
  NUM: "number",
  OBJ: "object"
});

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

var mutators, nodeTypeToMutatorMap;

// for working agnostically with immutable/mutable AST
function get (obj, prop) {
  if (typeof obj.get === TYPES.FUNC) {
    return obj.get(prop);
  }
  return obj[prop];
}

// for working agnostically with immutable/mutable AST
function size (obj) {
  if (typeof obj.size === TYPES.NUM) {
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
module.exports = function getMutatorForNode (node) {

  var nodeType = get(node, "type");

  switch (nodeType) {

  // obviously not going to proceed
  case undefined:
    return;

  // skip trying to mutate an empty array literal
  case ARRAY_EXPRESSION:
    if (size(get(node, "elements")) === 0) return;
    break;
  
  // skip trying to mutate an empty object literal
  case OBJECT_EXPRESSION:
    if (size(get(node, "properties")) === 0) return;
    break;

  // skip function if it has 0 or 1 params, b/c can't reverse order
  case FUNCTION_EXPRESSION:
  case FUNCTION_DECLARATION:
    if (size(get(node, "params")) < 2) return;
    break;

  // Literal nodes include RegExp literals as well as `null`
  // Skip them for now -- may be albe to mutate RegExp literals eventually
  case LITERAL:
    if (typeof get(node, "value") === TYPES.OBJ) return;
    break;
  
  // skip binary expressions for which no operator swap
  case BINARY_EXPRESSION:
    if (!(get(node, "operator") in BINARY_OPERATOR_SWAPS)) return;
    break;
  }

  if (nodeType in NODES_WITH_TEST) {
    return mutators.invertConditionalTest;
  }

  return nodeTypeToMutatorMap[nodeType] || null;
};


// mutators receive an IMMUTABLE NODE and return an IMMUTABLE NODE
mutators = Object.freeze({

  // inverts a conditional test with a bang
  //
  // `if (isReady) {}` => `if (!(isReady)) {}`
  // `while (arr.length) {} => `while(!(arr.length)) {}`
  // `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
  //
  // used for all nodes in NODES_WITH_TEST
  invertConditionalTest: function invertConditionalTest (node) {
    assertNodeTypeIn(node, NODES_WITH_TEST);
    return node.set("test", I.Map({
      type: UNARY_EXPRESSION,
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
  // `return something;` => `something;`
  removeReturn: function removeReturn (node) {
    assertNodeTypeIs(node, RETURN_STATEMENT);
    return I.Map({
      type: EXPRESSION_STATEMENT,
      expression: node.get("argument")
    });
  },

  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  dropArrayElement: function dropArrayElement (node) {
    assertNodeTypeIs(node, ARRAY_EXPRESSION);
    return node.set("elements", node.get("elements").slice(1));
  },

  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  dropObjectProperty: function dropObjectProperty (node) {
    assertNodeTypeIs(node, OBJECT_EXPRESSION);
    return node.set("properties", node.get("properties").slice(1));
  },

  // increments numbers, drops first character of strings, reverses booleans
  // `var MAGIC_NUM = 123` => `var MAGIC_NUM = 124`
  // `var name = 'Jack'` => `var name = 'ack'`
  // `var bool = true` => `var bool = false`
  tweakLiteralValue: function tweakLiteralValue (node) {
    assertNodeTypeIs(node, LITERAL);

    var newVal;
    var value = get(node, "value");
    
    switch (typeof value) {

    case TYPES.STR:
      newVal = value.slice(1);
      return node.merge({
        value: newVal,
        raw: '"' + newVal + '"'
      });

    case TYPES.NUM:
      newVal = value + 1;
      return node.merge({
        value: newVal,
        raw: String(newVal)
      });

    case TYPES.BOOL:
      newVal = !value;
      return node.merge({
        value: newVal,
        raw: String(newVal)
      });

    default:
      return node;

    }
  },

  // flips increment/decrement operators
  // `i++` => `i--`
  // `j--` => `j++`
  invertIncDecOperators: function invertIncDecOperators (node) {
    assertNodeTypeIs(node, UPDATE_EXPRESSION);

    var INC = "++";
    var DEC = "--";

    var prevOp = node.get("operator");
    var newOp = (prevOp === INC ? DEC : INC);
    
    return node.set("operator", newOp);
  },

  // swaps [+, -] and [*, /]
  // `age = age + 1` => `age = age -1`
  // `var since = new Date() - start` => `var since = new Date() + start`
  // `var dy = rise / run` => `var dy = rise * run`
  // `var area = w * h` => `var area = w / h`
  swapBinaryOperators: function swapBinaryOperators (node) {
    assertNodeType(node, BINARY_EXPRESSION);
    var prevOp = node.get("operator");
    var newOp = BINARY_OPERATOR_SWAPS[prevOp];
    return node.set("operator", newOp);
  },

  dropUnaryOperator: function dropUnaryOperator (node) {
    assertNodeType(node, UNARY_EXPRESSION);
    return node.get("argument");
  }

});

nodeTypeToMutatorMap = {
  Literal: mutators.tweakLiteralValue,
  ReturnStatement: mutators.removeReturn,
  ArrayExpression: mutators.dropArrayElement,
  ObjectExpression: mutators.dropObjectProperty,
  FunctionExpression: mutators.reverseFunctionParameters,
  FunctionDeclaration: mutators.reverseFunctionParameters,
  UpdateExpression: mutators.invertIncDecOperators,
  BinaryExpression: mutators.swapBinaryOperators,
  UnaryExpression: mutators.dropUnaryOperator
};
