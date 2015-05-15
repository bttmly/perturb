"use strict";

var I = require("immutable");

var constants = require("./constants");

var NODE_ATTRS = constants.NODE_ATTRS;
var NODE_TYPES = constants.NODE_TYPES;
var JS_TYPES = constants.JS_TYPES;
var BINARY_OPERATOR_SWAPS = constants.BINARY_OPERATOR_SWAPS;

var BANG = "!";
var VOID = "VOID";
var AND = "&&";
var OR = "||";

function get (obj, prop) {
  if (typeof obj.get === JS_TYPES.func) {
    return obj.get(prop);
  }
  return obj[prop];
}

function size (obj) {
  if (typeof obj.size === JS_TYPES.num) {
    return obj.size;
  }
  return obj.length;
}

function setValue (node, value) {
  return node.merge({
    value: value,
    raw: JSON.stringify(value)
  });
}

function isString (s) {
  return typeof s === JS_TYPES.str;
}

function isNumber (n) {
  return typeof n === JS_TYPES.num;
}

function isBoolean (b) {
  return typeof b === JS_TYPES.bool;
}

function stringLiteralTweakFn (node) {
  var value = get(node, NODE_ATTRS.value);
  return setValue(node, value.length ? value.slice(1) : "a");
}

function numberLiteralTweakFn (node) {
  var value = get(node, NODE_ATTRS.value);
  return setValue(node, value + 1);
}

function booleanLiteralTweakFn (node) {
  var value = get(node, NODE_ATTRS.value);
  return setValue(node, !value);
}

function objectLiteralTweakFn (node) {
  return node.set(NODE_ATTRS.properties, node.get(NODE_ATTRS.properties).slice(1));
}

function arrayLiteralTweakFn (node) {
  return node.set(NODE_ATTRS.elements, node.get(NODE_ATTRS.elements).slice(1));
}

var mutators = [
  {
    // inverts a conditional test with a bang
    // `if (isReady) {}` => `if (!(isReady)) {}`
    // `while (arr.length) {} => `while(!(arr.length)) {}`
    // `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
    name: "invertConditionalTest",
    type: constants.NODES_WITH_TEST,
    mutator: function (node) {
      return node.set(NODE_ATTRS.test, I.Map({
        type: NODE_TYPES.UnaryExpression,
        operator: BANG,
        argument: get(node, NODE_ATTRS.test)
      }));
    }
  }, {
    // reverse the perameter order for a function expression or declaration
    // `function fn (a, b)` {} => `function fn (b, a)`
    name: "reverseFunctionParameters",
    type: constants.FUNC_NODES,
    mutator: function (node) {
      return node.set(NODE_ATTRS.params, node.get(NODE_ATTRS.params).reverse());
    }
  }, {
    // drop return w/o affecting the rest of the expression/statement
    // if return statement has no argument, instead transform it into `void 0;`
    // `return something;` => `something;`
    // `return;` => `void 0;`
    name: "dropReturn",
    type: NODE_TYPES.ReturnStatement,
    mutator: function (node) {
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
    }
  }, {
    name: "dropThrow",
    type: NODE_TYPES.ThrowStatement,
    mutator: function (node) {
      return node.get(NODE_ATTRS.argument);
    }
  }, {
    name: "dropUnaryOperator",
    type: NODE_TYPES.UnaryExpression,
    mutator: function (node) {
      return node.get(NODE_ATTRS.argument);
    }
  }, {
    // drops first character of non-empty string; changes
    // empty strings to "a"
    // var s = ""; => var s = "a";
    // var name = "nick"; => var name = "ick";
    name: "tweakStringLiteral",
    type: NODE_TYPES.Literal,
    filter: function (node) {
      return isString(get(node, NODE_ATTRS.value));
    },
    mutator: function (node) {
      var value = stringLiteralTweakFn(node);
      return node.merge({
        value: value,
        raw: JSON.stringify(value)
      });
    }
  }, {
    // adds 1 to any number literal
    // var num = 0; => var num = 1;
    // var x = 735; => var x = 736;
    name: "tweakNumberLiteral",
    type: NODE_TYPES.Literal,
    filter: function (node) {
      return isNumber(get(node, NODE_ATTRS.value));
    },
    mutator: function (node) {
      var value = numberLiteralTweakFn(node);
      return node.merge({
        value: value,
        raw: JSON.stringify(value)
      });
    }
  }, {
    name: "tweakBooleanLiteral",
    type: NODE_TYPES.Literal,
    filter: function (node) {
      return isBoolean(get(node, NODE_ATTRS.value));
    },
    mutator: function (node) {
      var value = booleanLiteralTweakFn(node);
      return node.merge({
        value: value,
        raw: JSON.stringify(value)
      });
    }
  }, {
    // drops the first declared property in an object literal
    // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
    name: "tweakObjectLiteral",
    type: NODE_TYPES.ObjectExpression,
    filter: function (node) {
      return size(get(node, NODE_ATTRS.properties)) !== 0;
    },
    mutator: function (node) {
      return objectLiteralTweakFn(node);
    }
  }, {
    // drops the first declared element in an array literal
    // `['a', 'b']` => `['a']`
    name: "tweakArrayLiteral",
    type: NODE_TYPES.ArrayExpression,
    filter: function (node) {
      return size(get(node, NODE_ATTRS.elements)) !== 0;
    },
    mutator: function (node) {
      return arrayLiteralTweakFn(node);
    }
  }, {
    // swaps [+, -] and [*, /]
    // `age = age + 1;` => `age = age - 1;`
    // `var since = new Date() - start;` => `var since = new Date() + start;`
    // `var dy = rise / run;` => `var dy = rise * run;`
    // `var area = w * h;` => `var area = w / h;`
    name: "swapBinaryOperators",
    type: NODE_TYPES.BinaryExpression,
    mutator: function (node) {
      var prevOp = node.get(NODE_ATTRS.operator);
      var newOp = BINARY_OPERATOR_SWAPS[prevOp];
      return node.set(NODE_ATTRS.operator, newOp);
    }
  }, {
    // swaps && for || and vice versa
    // `if (x && y)` => `if (x || y)`
    // `while (f() || g())` => `while(f() && g())`
    name: "swapLogicalOperators",
    type: NODE_TYPES.LogicalExpression,
    mutator: function (node) {
      var prevOp = node.get(NODE_ATTRS.operator);
      var newOp = (prevOp === AND ? OR : AND);
      return node.set(NODE_ATTRS.operator, newOp);
    }
  }, {
    // drops a member assignment
    // `obj.prop = 'value';` => `obj.prop;`
    name: "dropMemberAssignment",
    type: NODE_TYPES.AssignmentExpression,
    mutator: function (node) {
      return node.get("left");
    }
  }
];








// increments numbers, drops first character of strings, reverses booleans
// `var MAGIC_NUM = 123` => `var MAGIC_NUM = 124`
// `var name = 'Jack'` => `var name = 'ack'`
// `var bool = true` => `var bool = false`


var mutatorsIndexedByNodeType = mutators.reduce(function (obj, mutator) {
  var types = mutator.types;
  if (!Array.isArray(types)) types = [types];

  types.forEach(function (t) {
    if (obj[t] == null) obj[t] = [];
    obj[t].push(mutator);
  });

  return obj;
});

module.exports = {
  mutatorsExistForNodeType: function (type) {
    return mutatorsIndexedByNodeType.hasOwnProperty(type);
  },

  getMutatorsForNodeType: function (type) {
    return mutatorsIndexedByNodeType[type];
  }
};






