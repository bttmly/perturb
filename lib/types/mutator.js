"use strict";

var util = require("util");

var ERRORS = require("../constant/errors");
var NODE_TYPES = require("../constant/node-types");
var FmtError = require("../util/fmt-error");

function has (obj) {
  return function (prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

function validNodeType (type) {
  if (!Array.isArray(type)) type = [type];
  return type.every(has(NODE_TYPES));
}

function getInvalidMessage (mutator) {
  // must have a name string
  if (typeof mutator.name !== "string") {
    // return false;
    return "Name must be a string " + util.inspect(mutator.name);
  }

  // must have a mutator function
  if (typeof mutator.mutator !== "function") {
    // return false;
    return "Mutator must be a function " + util.inspect(mutator.mutator);
  }
  
  // if filter is present, must be a function
  if (mutator.filter && typeof mutator.filter !== "function") {
    // return false;
    return "Filter must be a function if present " + util.inspect(mutator.filter);
  }
  
  // must have one of these properties
  if (!(mutator.nodeType || mutator.nodeTypes)) {
    // return false;
    return "Must have `nodeType` or `nodeTypes`";
  }

  // must not have both
  if (mutator.nodeType && mutator.nodeTypes) {
    // return false;
    return "Must not have both `nodeType` and `nodeTypes`";
  }

  // nodeTypes must be valid
  if (!validNodeType(mutator.nodeType || mutator.nodeTypes)) {
    // return false;
    return "Inavlid nodeType(s) " + util.inspect(mutator.nodeType || mutator.nodeTypes);
  }
}

function assertValidMutator (mutator) {
  var msg = getInvalidMessage(mutator);
  if (msg) {
    // console.log("Validation failed", msg);
    throw new FmtError(ERRORS.InvalidMutator, msg);
  }
  // if (isMutatorValid(mutator)) return;
  // throw new FmtError(ERRORS.InvalidMutator);
}

module.exports = assertValidMutator;
