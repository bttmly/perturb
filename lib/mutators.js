"use strict";

var util = require("util");

var Immutable = require("immutable");
var contains = require("lodash.contains");
var assign = require("object-assign");

var constants = require("./constants");

var NODE_ATTRS = constants.NODE_ATTRS;
var NODE_TYPES = constants.NODE_TYPES;
var JS_TYPES = constants.JS_TYPES;
var BINARY_OPERATOR_SWAPS = constants.BINARY_OPERATOR_SWAPS;

var BANG = "!";
var VOID = "void";
var AND = "&&";
var OR = "||";

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
  var value = node.get(NODE_ATTRS.value);
  return setValue(node, value.length ? value.slice(1) : "a");
}

// 1 => 0; 0 => 1; 345 => 346;
function numberLiteralTweakFn (node) {
  var value = node.get(NODE_ATTRS.value);
  return setValue(node, (value === 1 ? 0 : value + 1));
}

function booleanLiteralTweakFn (node) {
  return setValue(node, node.get(NODE_ATTRS.value));
}

function objectLiteralTweakFn (node) {
  return node.set(NODE_ATTRS.properties, node.get(NODE_ATTRS.properties).slice(1));
}

function arrayLiteralTweakFn (node) {
  return node.set(NODE_ATTRS.elements, node.get(NODE_ATTRS.elements).slice(1));
}

// type Mutator struct {
//   name string,
//   type string | []string
//   filter function?
//   mutator function
// }

// S({
//   name: S.String,
//   type: S.String.or(S.arrayOf(S.String)),
//   filter: S.Maybe(S.Function),
//   mutator: S.Function
// })

var mutators = Object.freeze([
  {
    // inverts a conditional test with a bang
    // `if (isReady) {}` => `if (!(isReady)) {}`
    // `while (arr.length) {} => `while(!(arr.length)) {}`
    // `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
    name: "invertConditionalTest",
    type: Object.keys(constants.NODES_WITH_TEST),
    filter: function (node) {
      return node.has(NODE_ATTRS.test);
    },
    mutator: function (node) {
      return node.set(NODE_ATTRS.test, Immutable.Map({
        type: NODE_TYPES.UnaryExpression,
        operator: BANG,
        argument: node.get(NODE_ATTRS.test)
      }));
    }
  }, {
    // reverse the perameter order for a function expression or declaration
    // `function fn (a, b)` {} => `function fn (b, a)`
    name: "reverseFunctionParameters",
    type: Object.keys(constants.FUNC_NODES),
    filter: function (node) {
      return node.get(NODE_ATTRS.params).size > 1;
    },
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
      var arg = node.get(NODE_ATTRS.argument);

      if (arg) {
        return Immutable.Map({
          type: NODE_TYPES.ExpressionStatement,
          expression: arg
        });
      }

      return voidNode();
    }

  }, {
    // throw new Error(); => new Error();
    // delete obj.x; => obj.x;
    // typeof obj; => obj;
    // +new Date(); => new Date();
    name: "dropOperator",
    type: [
      NODE_TYPES.ThrowStatement,
      NODE_TYPES.UnaryExpression
    ],
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
      return isString(node.get(NODE_ATTRS.value));
    },
    mutator: function (node) {
      return stringLiteralTweakFn(node);
    }
  }, {
    // adds 1 to any number literal
    // var num = 0; => var num = 1;
    // var x = 735; => var x = 736;
    name: "tweakNumberLiteral",
    type: NODE_TYPES.Literal,
    filter: function (node) {
      return isNumber(node.get(NODE_ATTRS.value));
    },
    mutator: function (node) {
      return numberLiteralTweakFn(node);
    }
  }, {
    name: "tweakBooleanLiteral",
    type: NODE_TYPES.Literal,
    filter: function (node) {
      return isBoolean(node.get(NODE_ATTRS.value));
    },
    mutator: function (node) {
      return booleanLiteralTweakFn(node);
    }
  }, {
    // drops the first declared property in an object literal
    // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
    name: "tweakObjectLiteral",
    type: NODE_TYPES.ObjectExpression,
    filter: function (node) {
      return node.get(NODE_ATTRS.properties).size !== 0;
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
      return node.get(NODE_ATTRS.elements).size !== 0;

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
    filter: function (node) {
      return node.getIn(["left", "type"]) === NODE_TYPES.MemberExpression;
    },
    mutator: function (node) {
      return node.get("left");
    }
  }, {
    // drops a function call made for side effects
    // (the return value isn't assigned to a variable)
    // (will this cause lots of test timeouts due to uncalled callbacks?)
    name: "dropVoidCall",
    type: NODE_TYPES.ExpressionStatement,
    filter: function (node) {
      if (node.getIn(["expression", "type"]) !== NODE_TYPES.CallExpression) {
        return false;
      }

      // skip method calls of objects since often called for side effects on `this`
      if (node.getIn(["callee", "type"]) !== NODE_TYPES.Identifier) {
        return false;
      }

    },
    mutator: voidNode
  }, {
    name: "dropNode",
    type: [
      NODE_TYPES.ContinueStatement,
      NODE_TYPES.BreakStatement
    ],
    mutator: voidNode
  }
]);

function voidNode () {
  return Immutable.fromJS({
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

function wrapMutator (m) {

  var extendWith = {
    mutator: function (node) {

      assert(I.Iterable.isKeyed(node), "Argument must be an immutable keyed iterable.")

      var type = node.get(NODE_ATTRS.type);

      if (!contains(m.type, type)) {
        var s = util.format("mutator %s does not accept nodes of type %s", m.name, type);
        throw new Error(s);
      }

      return m.mutator(node);
    }
  };

  if (m.filter) {
    extendWith.filter = function (node) {
      assert(I.Iterable.isKeyed(node), "Argument must be an immutable keyed iterable.");

      return m.filter(node);
    };
  }

  return assign({}, m, extendWith);
}

var mutatorsIndexedByNodeType = mutators
  .map(wrapMutator)
  .reduce(function (obj, mutator) {
    var types = mutator.type;

    if (!Array.isArray(types)) types = [types];

    types.forEach(function (t) {
      if (obj[t] == null) obj[t] = [];
      obj[t].push(mutator);
    });

    return obj;
  }, {}
);

// WIP (eventually for turning on/off mutations)
function parseComment (comment) {
  var c = comment.get("value");
  if (c.trim() === "") return;
}


module.exports = {
  mutatorsExistForNodeType: function (type) {
    assert(isString(type), "Argument must be a string");
    return mutatorsIndexedByNodeType.hasOwnProperty(type);
  },

  getMutatorsForNode: function (node) {
    assert(I.Iterable.isKeyed(node), "Argument must be an immutable keyed iterable.")
    return mutatorsIndexedByNodeType[node.get("type")] || [];
  },

  get mutators () {
    if (process.env.NODE_ENV !== "testing") {
      throw new Error("'mutators' property can only be read during testing.");
    }
    return mutators;
  }
};






