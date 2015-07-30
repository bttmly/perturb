"use strict";

var ERRORS = require("../constant/errors");
var NODE_TYPES = require("../constant/node-types");
var FmtError = require("../util/fmt-errmor");

function has (obj) {
  return function (prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

function validNodeType (type) {
  if (!Array.isArray(type)) type = [type];
  return type.every(has(NODE_TYPES));
}

function isMutatorValid (mutator) {
  // must have a name string
  if (typeof mutator.name !== "string") return false;
  // must have a mutator function
  if (typeof mutator.mutator !== "function") return false;
  // if filter is present, must be a function
  if (mutator.filter && typeof mutator.filter !== "function") return false;
  // must have one of these properties
  if (!(mutator.nodeType || mutator.nodeTypes)) return false;
  // must not have both
  if (mutator.nodeType && mutator.nodeTypes) return false;
  // nodeTypes must be valid
  if (!validNodeType(mutator.nodeType || mutator.nodeTypes)) return false;
  return true;
}

function assertValidMutator (mutator) {
  if (isMutatorValid(mutator)) return;
  throw new FmtError(ERRORS.InvalidMutator);
}

module.exports = assertValidMutator;
