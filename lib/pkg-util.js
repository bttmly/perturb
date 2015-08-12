"use strict";

var assign = require("object-assign");
var chalk = require("chalk");
var changeCase = require("change-case");

function blank (obj) {
  var ret = Object.create(null);
  if (obj) assign(ret, obj);
  return ret;
}

var util = module.exports = {

  constObj: function (obj) {
    return Object.freeze(blank(obj));
  },

  mutantCount: function (matches, callback) {
    var count = 0;
    matches.forEach(function (match) {
      match.mutants.forEach(function (mutant) {
        if (callback(mutant)) count += 1;
      });
    });
    return count;
  },

  mutantIsDead: function (mutant) {
    return !!mutant.failed;
  },

  mutantIsAlive: function (mutant) {
    return !!(mutant.passedCount && !mutant.failed);
  },

  countAllMutants: function (matches) {
    return util.mutantCount(matches, function () { return true; });
  },

  countAliveMutants: function (matches) {
    return util.mutantCount(matches, util.mutantIsAlive);
  },

  countDeadMutants: function (matches) {
    return util.mutantCount(matches, util.mutantIsDead);
  },

  mutantId: function (mutant) {
    return changeCase.sentence(mutant.name) + " @" + mutant.loc;
  },
};
