// open question
// should the loading and wrapping of plugin mutators be handled here?

"use strict";

var assert = require("assert");

var assign = require("object-assign");
var contains = require("lodash.contains");
var IIterable = require("immutable").Iterable;

var assertMutatorIsValid = require("./types/mutator");
var FmtError = require("./util/fmt-error");
var isString = require("./util/is-string");
var NODE_ATTRS = require("./constant/node-attrs");

var coreMutators = [
  require("./mutations/drop-member-assignment"),
  require("./mutations/drop-node"),
  require("./mutations/drop-operator"),
  require("./mutations/drop-return"),
  require("./mutations/drop-void-call"),
  require("./mutations/invert-conditional-test"),
  require("./mutations/reverse-function-parameters"),
  require("./mutations/swap-binary-operators"),
  require("./mutations/swap-logical-operators"),
  require("./mutations/tweak-array-literal"),
  require("./mutations/tweak-boolean-literal"),
  require("./mutations/tweak-number-literal"),
  require("./mutations/tweak-object-literal"),
  require("./mutations/tweak-string-literal"),
];


function wrapMutator (m) {

  assertMutatorIsValid(m);

  var extendWith = {
    mutator: function (node) {
      assert(IIterable.isKeyed(node), "Argument must be an immutable keyed iterable.");
      var type = node.get(NODE_ATTRS.type);
      if (!contains(m.type, type)) {
        throw new FmtError("mutator %s does not accept nodes of type %s", m.name, type);
      }
      return m.mutator(node);
    },
  };

  if (m.filter) {
    extendWith.filter = function (node) {
      assert(IIterable.isKeyed(node), "Argument must be an immutable keyed iterable.");
      return m.filter(node);
    };
  }

  return assign({}, m, extendWith);
}

// temporary stub -- this function will return false for disabled mutators (based on config)
function isMutatorEnabled () {
  return true;
}

// temporary stub -- plugin mutators will go into this array
var mutatorPlugins = [];

// creating the internal state of this module should happen in the exported function
// so we can pass in config, which is necessary for filtering out disabled mutators
var mutatorsIndexedByNodeType = coreMutators
  .concat(mutatorPlugins)
  .filter(isMutatorEnabled)
  .map(wrapMutator)
  .reduce(function (obj, mutator) {
    var types = mutator.type;

    if (!Array.isArray(types)) types = [types];

    types.forEach(function (t) {
      if (obj[t] == null) obj[t] = [];
      obj[t].push(mutator);
    });

    return obj;
  }, {});

function mutatorsExistForNodeType (type) {
  assert(isString(type), "Argument must be a string");
  return mutatorsIndexedByNodeType.hasOwnProperty(type);
}

function getMutatorsForNode (node) {
  assert(IIterable.isKeyed(node), "Argument must be an immutable keyed iterable.");
  var type = node.get("type");
  if (!mutatorsExistForNodeType(type)) return [];
  return mutatorsIndexedByNodeType[type];
}

module.exports = {
  mutatorsExistForNodeType: mutatorsExistForNodeType,
  getMutatorsForNode: getMutatorsForNode,

  // TODO: need to allow for environment variable injection

  // get mutators () {
  //   if (process.env.NODE_ENV !== "testing") {
  //     throw new Error("'mutators' property can only be read during testing.");
  //   }
  //   return mutators;
  // }

  mutators: coreMutators,
};
