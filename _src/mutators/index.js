// open question
// should the loading and wrapping of plugin mutators be handled here?

"use strict";

var assert = require("assert");

var assign = require("object-assign");
var contains = require("lodash.contains");
var IIterable = require("immutable").Iterable;

// var assertMutatorIsValid = require("./types/mutator");
// var FmtError = require("./util/fmt-error");
// var isString = require("./util/is-string");

var NODE_ATTRS = require("../constants/node-attrs");

var coreMutators = [
  require("./drop-member-assignment"),
  require("./drop-node"),
  require("./drop-operator"),
  require("./drop-return"),
  require("./drop-void-call"),
  require("./invert-conditional-test"),
  require("./reverse-function-parameters"),
  require("./swap-binary-operators"),
  require("./swap-logical-operators"),
  require("./tweak-array-literal"),
  require("./tweak-boolean-literal"),
  require("./tweak-number-literal"),
  require("./tweak-object-literal"),
  require("./tweak-string-literal"),
];


function wrapMutator (m) {

  // assertMutatorIsValid(m);

  var extendWith = {
    mutator: function (node) {
      assert(IIterable.isKeyed(node), "Argument must be an immutable keyed iterable.");
      var type = node.get(NODE_ATTRS.type);
      
      // if (!contains(m.type, type)) {
      //   throw new FmtError("mutator %s does not accept nodes of type %s", m.name, type);
      // }
      
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
  // assert(isString(type), "Argument must be a string");
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

  mutators: coreMutators,
};
