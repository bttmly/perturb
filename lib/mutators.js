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
var FUNCTION_DECLARATION = "FunctionDeclaration";

var EXPRESSION_STATEMENT = "ExpressionStatement";
var UNARY_EXPRESSION = "UnaryExpression";

var NODES_WITH_TEST = util.constObj({
  "IfStatement": 1,
  "WhileStatement": 1,
  "DoWhileStatement": 1,
  "ForStatement": 1,
  "ConditionalExpression": 1,
  "SwitchCase": 1
});

var mutators;

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

module.exports = function getMutatorForNode (node) {

  var nodeTypeToMutatorMap = {
    Literal: mutators.tweakLiteralValue,
    ReturnStatement: mutators.removeReturn,
    ArrayExpression: mutators.dropArrayElement,
    ObjectExpression: mutators.dropObjectProperty,
    FunctionExpression: mutators.reverseFunctionParameters,
    FunctionDeclaration: mutators.reverseFunctionParameters
  };

  var nodeType = get(node, "type");

  // skip trying to mutate an empty array literal
  if (nodeType === ARRAY_EXPRESSION && size(get(node, "elements")) === 0 ) {
    return false;
  }

  // skip trying to mutate an empty object literal
  if (nodeType === OBJECT_EXPRESSION && size(get(node, "properties")) === 0) {
    return false;
  }

  // can't reverse the order of parameters if a function takes 0 or 1
  if ((nodeType === FUNCTION_EXPRESSION || nodeType === FUNCTION_DECLARATION) && size(get(node, "params")) < 2) {
    return false;
  }

  if (nodeType in NODES_WITH_TEST) {
    return mutators.invertConditionalTest;
  }

  return nodeTypeToMutatorMap[nodeType] || null;
};


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

  // increments numbers, drops first character of strings
  // `var MAGIC_NUM = 123` => `var MAGIC_NUM = 124`
  // `var name = 'Jack'` => `var name = 'ack'`
  tweakLiteralValue: function tweakLiteralValue (node) {
    var value = node.get("value");
    var type = typeof value;
    if (type === "string") {
      var newVal = value.slice(1);
      return node
        .set("value", newVal)
        .set("raw", '"' + newVal + '"');
    }
    if (type === "number") {
      return node
        .set("value", value + 1)
        .set("raw", String(value + 1));
    }
    return node;
  }
};
