"use strict";

var assign = require("object-assign");
var I = require("immutable");

var util = require("./util");

// var OPPOSITES = util.blank({
//   "<": ">=",
//   ">": "<=",
//   ">=": "<",
//   "<=": ">",
//   "+": "-",
//   "-": "+",
//   "*": "/",
//   "/": "*",
//   "==": "!==",
//   "===": "!==="
// });

var BANG = "!";

var ARRAY_EXPRESSION = "ArrayExpression";
var OBJECT_EXPRESSION = "ObjectExpression";
var FUNCTION_EXPRESSION = "FunctionExpression";
var BINARY_EXPRESSION = "BinaryExpression";
var FUNCTION_DECLARATION = "FunctionDeclaration";
var EXPRESSION_STATEMENT = "ExpressionStatement";
var UNARY_EXPRESSION = "UnaryExpression";
var LITERAL = "Literal";

var NODES_WITH_TEST = util.constObj({
  "IfStatement": 1,
  "WhileStatement": 1,
  "DoWhileStatement": 1,
  "ForStatement": 1,
  "ConditionalExpression": 1,
  "SwitchCase": 1
});

var TYPES = util.constObj({
  BOOL: "boolean",
  STR: "string",
  NUM: "number"
});

var ARITHMETIC_SWAPS = util.constObj({
  "+": "-",
  "-": "+",
  "*": "/",
  "/": "*"
});

var mutators, nodeTypeToMutatorMap;

// for working agnostically with immutable/mutable AST
function get (obj, prop) {
  if (typeof obj.get === "function") {
    return obj.get(prop);
  }
  return obj[prop];
}

// for working agnostically with immutable/mutable AST
function size (obj) {
  if (typeof obj.size === "number") {
    return obj.size;
  }
  return obj.length;
}


// consumers of this function may either want:
// 1. To know whether or not a given node WILL be mutated --OR--
// 2. The mutation function itself, for use

// In case 2. the node must be immutable, however for case 1. we
// accept a mutable or immutable node. 
module.exports = function getMutatorForNode (node) {

  var nodeType = get(node, "type");

  if (nodeType === undefined) {
    return null;
  }

  // skip trying to mutate an empty array literal
  if (nodeType === ARRAY_EXPRESSION && size(get(node, "elements")) === 0 ) {
    return null;
  }

  // skip trying to mutate an empty object literal
  if (nodeType === OBJECT_EXPRESSION && size(get(node, "properties")) === 0) {
    return null;
  }

  // skip function if it has 0 or 1 params, b/c can't reverse order
  if ((nodeType === FUNCTION_EXPRESSION || nodeType === FUNCTION_DECLARATION) && size(get(node, "params")) < 2) {
    return null;
  }

  // Literal nodes include RegExp literals as well as `null`
  // Skip them for now -- may be albe to mutate RegExp literals eventually
  if (nodeType === LITERAL && typeof get(node, "value") === "object") {
    return null;
  }

  // skip binary expressions for which no operator swap
  if (nodeType === BINARY_EXPRESSION && !(get(node, "operator") in ARITHMETIC_SWAPS)) {
    return null;
  }

  if (nodeType in NODES_WITH_TEST) {
    return mutators.invertConditionalTest;
  }

  return nodeTypeToMutatorMap[nodeType] || null;
};

// mutators receive an IMMUTABLE NODE and return an IMMUTABLE NODE
mutators = {

  // inverts a conditional test with a bang
  //
  // `if (isReady) {}` => `if (!(isReady)) {}`
  // `while (arr.length) {} => `while(!(arr.length)) {}`
  // `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
  //
  // used for all nodes in NODES_WITH_TEST
  invertConditionalTest: function invertConditionalTest (node) {
    return node.set("test", I.Map({
      type: UNARY_EXPRESSION,
      operator: BANG,
      argument: get(node, "test")
    }));
  },

  // reverse the perameter order for a function expression or declaration
  // `function fn (a, b)` {} => `function fn (b, a)`
  reverseFunctionParameters: function reverseFunctionParameters (node) {
    return node.set("params", node.get("params").reverse());
  },

  // drop return w/o affecting the rest of the expression/statement
  // `return something;` => `something;`
  removeReturn: function removeReturn (node) {
    return I.Map({
      type: EXPRESSION_STATEMENT,
      expression: node.get("argument")
    });
  },

  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  dropArrayElement: function dropArrayElement (node) {
    return node.set("elements", node.get("elements").slice(1));
  },

  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  dropObjectProperty: function dropObjectProperty (node) {
    return node.set("properties", node.get("properties").slice(1));
  },

  // increments numbers, drops first character of strings, reverses booleans
  // `var MAGIC_NUM = 123` => `var MAGIC_NUM = 124`
  // `var name = 'Jack'` => `var name = 'ack'`
  // `var bool = true` => `var bool = false`
  tweakLiteralValue: function tweakLiteralValue (node) {
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

    case TYPES.RE:
      return;

    default:
      return node;

    }
  },

  // flips increment/decrement operators
  // `i++` => `i--`
  // `j--` => `j++`
  invertIncDecOperators: function invertIncDecOperators (node) {
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
  swapArithmeticOperators: function swapArithmeticOperators (node) {

    var prevOp = node.get("operator");
    var newOp = ARITHMETIC_SWAPS[prevOp];

    if (newOp === undefined) {
      return node;
    }

    return node.set("operator", newOp);
  },

};

nodeTypeToMutatorMap = {
  Literal: mutators.tweakLiteralValue,
  ReturnStatement: mutators.removeReturn,
  ArrayExpression: mutators.dropArrayElement,
  ObjectExpression: mutators.dropObjectProperty,
  FunctionExpression: mutators.reverseFunctionParameters,
  FunctionDeclaration: mutators.reverseFunctionParameters,
  UpdateExpression: mutators.invertIncDecOperators,
  BinaryExpression: mutators.swapArithmeticOperators
};

// Drop UnaryExpression: `return node.get("argument");`