"use strict";

var assert = require("assert");

var assign = require("object-assign");
var chalk = require("chalk");
var changeCase = require("change-case");
var pick = require("lodash.pick");

var util = module.exports = {
  // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
  escapeForRegex: function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  endsWithRe: function (str, flags) {
    str = util.escapeForRegex(str);
    flags = flags || "";
    return new RegExp(str + "$");
  },

  startsWithRe: function (str, flags) {
    str = util.escapeForRegex(str);
    flags = flags || "";
    return new RegExp("^" + str);
  },

  objFilterUndefined: function (obj) {
    return pick(obj, function (val) {
      return val !== undefined;
    });
  },

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
      }, util.blank())
    );
  },

  blank: function () {
    return Object.create(null);
  },

  constObj: function (obj) {
    return Object.freeze(assign(util.blank(), obj));
  },

  hrtimeToSeconds: function (hrtime) {
    return (hrtime[0] * 1e9 + hrtime[1]) / 1e6;
  },

  reverseStr: function (str) {
    return str.split("").reverse().join("");
  },

  StringEnum: function (arr) {
    var cache = util.mapMirror(arr);

    function test (value) {
      return value in cache;
    }

    function enumFunc (value) {
      if (test(value)) {
        throw new TypeError("Value '" + value + "' not included in Enum[" + arr.toString() + "]");
      }
    }

    enumFunc.test = test;
    return enumFunc;
  },

  mutantCount: function (matches, callback) {
    var count = 0;
    matches.forEach(function (match) {
      match.mutations.forEach(function (mutant) {
        if (callback(mutant)) {
          count += 1;
        }
      });
    });
    return count;
  },

  mutantIsDead: function (mutant) {
    return !!mutant.failed;
  },

  mutantIsZombie: function (mutant) {
    return mutant.passedCount && !mutant.failed;
  },

  mutantIsAlive: function (mutant) {
    return mutant.passedCount && !mutant.failed;
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

  reverseString: function (str) {
    assert(typeof str, "string", "Argument must be a string");
    return str.split("").reverse().join("");
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

    // var passFail = [
    //   "Passed:",
    //   mutant.passed.length,
    //   "; Failed:",
    //   mutant.failed.length,
    // ].join(" ");

    return [
      // chalk.gray(passFail),
      chalk.gray.underline(alive + id),
      mutant.diff.map(function (entry) {
        var added = !!entry.added;
        var color = added ? "green" : "red";
        // var prefix = added ? "added:  " : "removed:";
        var sign = added ? plus : minus;
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

  callWithArgs: function () {
    var args = [].slice.call(arguments);
    return function (fn) {
      return fn.apply(this, args);
    };
  },

  tryCall: function (fnToCall, cb) {
    var result, error;
    try {
      result = fnToCall();
    } catch (e) {
      error = e;
    }
    cb(error, result);
  },

  Error: BetterError
};

function BetterError () {
  Error.captureStackTrace(this, BetterError);
  this.message = util.print.apply(null, arguments);
  this.name = "Error";
}

BetterError.prototype = Object.create(Error.prototype);
