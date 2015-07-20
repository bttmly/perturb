"use strict";
var util = require("util");

var some = require("lodash.some");
var last = require("lodash.last");

var pkgUtil = require("./pkg-util");
var constants = require("./constants");

var NODE_TYPES = constants.NODE_TYPES;
var JS_TYPES = constants.JS_TYPES;

// these functions are called when traversing an AST to determine if
// a node should be ignored. A skip function returns TRUE for DO IGNORE
// skip functions receive a MUTABLE node
var fns = [

  // skip specific recursing down specific property names (just 'loc' for now)
  (function () {
    var KEYS_TO_SKIP = pkgUtil.constObj({
      "loc": true
    });
    return function skipByKey (_, path) {
      return (KEYS_TO_SKIP[last(path)]);
    };
  })(),

  // this handles RegExp literals (value prop as well as {pattern, flags})
  function skipUntypedNode (node) {
    return typeof node.type !== "string";
  },

  // skip mutating require calls when the argument is a plain string
  function skipRequire (node) {
    return (
      node.type === NODE_TYPES.CallExpression &&
      node.callee.name === "require" &&
      node.arguments.length === 1 &&
      node.arguments[0].type === NODE_TYPES.Literal &&
      typeof node.arguments[0].type === JS_TYPES.str
    );
  },

  // skip mutating a "use strict" declaration
  function skipUseStrict (node) {
    return (
      node.type === NODE_TYPES.ExpressionStatement &&
      node.expression.value === "use strict"
    );
  }

];

function shouldSkip (node, path) {
  return fns.some(callWith(node, path));
}

function callWith () {
  var args = arguments;
  return function (fn) {
    return fn.apply(this, args);
  };
}

module.exports = shouldSkip;
