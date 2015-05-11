// mutators receive an IMMUTABLE NODE and return an IMMUTABLE NODE

//
// used for all nodes in NODES_WITH_TEST

var nodes = {
  VOID_0: {

  }
};

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
    name: "dropReturn",
    type: NODE_TYPES.ReturnStatement,
    mutator: (node) {
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
    name: "tweakArrayLiteral",
    type: NODE_TYPES.ArrayExpression,
    mutator: arrayLiteralTweakFn,
  }, {
    name: "tweakObjectLiteral",
    type: NODE_TYPES.ObjectExpression,
    mutator: objectLiteralTweakFn,
  }, {
    name: "tweakStringLiteral",
    type: NODE_TYPES.Literal,
    filter: function (node) {

    },
    mutator: stringLiteralTweakFn
  }
];


// drop return w/o affecting the rest of the expression/statement
// if return statement has no argument, instead transform it into `void 0;`
// `return something;` => `something;`
// `return;` => `void 0;`
var dropReturn =
};

var dropThrow =
};

// drops the first declared element in an array literal
// `['a', 'b']` => `['a']`
var tweakArrayLiteral = ;

// drops the first declared property in an object literal
// `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
var tweakObjectLiteral = ;

var tweakStringLiteral = ;

var tweakNumberLiteral = {
  name: "tweakNumberLiteral",
  type: NODE_TYPES.Literal,
  filter: function (node) {

  },
  mutator: numberLiteralTweakFn
};

var tweakBooleanLiteral = {
  name: "tweakBooleanLiteral",
  type: NODE_TYPES.Literal,
  filter: function (node) {

  },
  mutator: booleanLiteralTweakFn
};

var swapLogicalOperators = {
  name: "swapLogicalOperators",
  type: NODE_TYPES.LogicalExpression,
  mutator: function (node) {

  }
};

var swapBinaryOperators = {

};

var dropUnaryOperator = {

};

// increments numbers, drops first character of strings, reverses booleans
// `var MAGIC_NUM = 123` => `var MAGIC_NUM = 124`
// `var name = 'Jack'` => `var name = 'ack'`
// `var bool = true` => `var bool = false`
function tweakPrimitiveLiteral (node) {
  assertNodeTypeIs(node, NODE_TYPES.Literal);

  var newVal;

  switch (typeof get(node, NODE_ATTRS.value)) {

  case JS_TYPES.str:
    newVal = stringLiteralTweakFn(node);
    break;

  case JS_TYPES.num:
    newVal = numberLiteralTweakFn(node);
    break;

  case JS_TYPES.bool:
    newVal = booleanLiteralTweakFn(node);
    break;
  }

  // RegExp literals get here I think
  if (newVal == null) return null;

  return node.merge({
    value: newVal,
    raw:JSON.stringify(newVal)
  });
}

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
function swapLogicalOperators (node) {
  assertNodeTypeIs(node, NODE_TYPES.LogicalExpression); {
    var prevOp = node.get(NODE_ATTRS.operator);
    var newOp = (prevOp === AND ? OR : AND);
    return node.set(NODE_ATTRS.operator, newOp);
  }
}

// swaps [+, -] and [*, /]
// `age = age + 1;` => `age = age - 1;`
// `var since = new Date() - start;` => `var since = new Date() + start;`
// `var dy = rise / run;` => `var dy = rise * run;`
// `var area = w * h;` => `var area = w / h;`
function swapBinaryOperators (node) {
  assertNodeTypeIs(node, NODE_TYPES.BinaryExpression);
  var prevOp = node.get(NODE_ATTRS.operator);
  var newOp = BINARY_OPERATOR_SWAPS[prevOp];
  return node.set(NODE_ATTRS.operator, newOp);
}

// removes a unary operator, leaving just the operator's argument
// `delete obj.prop;` => `obj.prop;`
// `return !v;` => `return v;`
function dropUnaryOperator (node) {
  assertNodeTypeIs(node, NODE_TYPES.UnaryExpression);
  return node.get(NODE_ATTRS.argument);
}

// drops a member assignment
// `obj.prop = 'value';` => `obj.prop;`
function dropMemberAssignment (node) {
  assertNodeTypeIs(node, NODE_TYPES.AssignmentExpression);
  return node.get("left");
}

// these should probably be configurable I guess
function stringLiteralTweakFn (node) {
  var value = get(node, NODE_ATTRS.value);
  return value.length ? value.slice(1) : "a";
}

function numberLiteralTweakFn (node) {
  var value = get(node, NODE_ATTRS.value);
  return value + 1;
}

function booleanLiteralTweakFn (node) {
  var value = get(node, NODE_ATTRS.value);
  return !value;
}

function objectLiteralTweakFn (node) {
  return node.set(NODE_ATTRS.properties, node.get(NODE_ATTRS.properties).slice(1));
}

function arrayLiteralTweakFn (node) {
  return node.set(NODE_ATTRS.elements, node.get(NODE_ATTRS.elements).slice(1));
}

getMutatorForNode.mutators = mutators;
module.exports = getMutatorForNode;
