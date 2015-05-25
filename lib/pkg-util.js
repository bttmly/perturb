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

  // {a: 'x', b: 'y'} => {a: 'a', b: 'b'}
  // ['a', 'b'] => {a: 'a', b: 'b'}
  // result has null prototype
  // safe to use like `if ('asdf' in obj)` since no methods or props are inherited
  mapMirror: function (input) {
    var keys = Array.isArray(input) ? input : Object.keys(input);
    return Object.freeze(
      keys.reduce(function (result, str) {
        if (typeof str !== "string") {
          throw new TypeError("Needs a string");
        }
        result[str] = str;
        return result;
      }, blank())
    );
  },

  constObj: function (obj) {
    return Object.freeze(blank(obj));
  },

  mutantCount: function (matches, callback) {
    var count = 0;
    matches.forEach(function (match) {
      match.mutations.forEach(function (mutant) {
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

  prettyPrintMutant: function (mutant) {

    // var alive = "\u2714  ";
    // var zombie = "\u26A0  ";
    // var killed = "\u2718  ";

    var alive = "#ALIVE: ";
    var dead = "#DEAD: ";

    var id = util.mutantId(mutant);

    if (util.mutantIsDead(mutant)) {
      return chalk.green(dead + id);
    }

    var plus = "+    ";
    var minus = "-    ";

    return [
      chalk.gray.underline(alive + id),
      mutant.diff.map(function (entry) {
        var color = entry.added ? "green" : "red";
        var sign = entry.added ? plus : minus;
        return chalk[color](sign + entry.value.trim());
      }).join("\n")
    ].join("\n");
  },

  print: function (str) {
    var args = [].slice.call(arguments, 1);
    var i = -1;
    return str.replace(/\%s/g, function () {
      i++;
      return args[i];
    });
  },
};
