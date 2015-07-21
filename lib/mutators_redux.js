"use strict";

var assert = require("assert");
var util = require("util");

var assign = require("object-assign");
var contains = require("lodash.contains");
var IIterable = require("immutable").Iterable;

var isString = require("./util/is-string");
var NODE_ATTRS = require("./constant/node-attrs");

var mutators = [
  require("./mutations/drop-member-assignment"),
  require("./mutations/drop-node"),
  require("./mutations/drop-operator"),
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

  var extendWith = {
    mutator: function (node) {
      assert(IIterable.isKeyed(node), "Argument must be an immutable keyed iterable.");
      var type = node.get(NODE_ATTRS.type);
      if (!contains(m.type, type)) {
        var s = util.format("mutator %s does not accept nodes of type %s", m.name, type);
        throw new Error(s);
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


// apply a filter here for turned off mutators

// concat third party mutators.

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

module.exports = {
  mutatorsExistForNodeType: function (type) {
    assert(isString(type), "Argument must be a string");
    return mutatorsIndexedByNodeType.hasOwnProperty(type);
  },

  getMutatorsForNode: function (node) {
    assert(IIterable.isKeyed(node), "Argument must be an immutable keyed iterable.");
    return mutatorsIndexedByNodeType[node.get("type")] || [];
  },

  // TODO: need to allow for environment variable injection

  // get mutators () {
  //   if (process.env.NODE_ENV !== "testing") {
  //     throw new Error("'mutators' property can only be read during testing.");
  //   }
  //   return mutators;
  // }

  mutators: mutators,
};
