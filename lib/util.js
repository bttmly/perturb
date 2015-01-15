"use strict";

var assign = require("object-assign");
var chalk = require("chalk");
var changeCase = require("change-case");

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

  // {a: 'x', b: 'y'} => {a: 'a', b: 'b'}
  // ['a', 'b'] => {a: 'a', b: 'b'}
  // result has null prototyp
  // safe to use like `if ('asdf' in obj)` since no methods are inherited
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

  StringEnum: function (arr) {
    var cache = util.mapMirror(arr);
    function test (value) {
      return value in cache;
    };
    function enumFunc (value) {
      if (test(value)) {
        throw new TypeError("Value '" + value + "' not included in Enum[" + arr.toString() + "]");
      }
    };
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

  mutantIsAlive: function (mutant) {
    return mutant.passed.length && !mutant.failed.length;
  },

  countAllMutants: function (matches) {
    return util.mutantCount(matches, function () { return true; });
  },

  countAliveMutants: function (matches) {
    return util.mutantCount(matches, util.mutantIsAlive);
  },

  prettyDiff: function (mutation) {
    if (!mutation.loc || !mutation.diff) return "";
    var spacer = "  ";
    var plus = "+ ";
    var minus = "- ";
    return [
      chalk.blue.underline(changeCase.sentence(mutation.name) + " @" + mutation.loc),
      mutation.diff.map(function (entry) {
        var added = !!entry.added;
        var color = added ? "green" : "red";
        var prefix = added ? "added:  " : "removed:";
        var sign = added ? plus : minus;
        return prefix + spacer + sign + chalk[color](entry.value.trim());
      }).join("\n"),
      ""
    ].join("\n");
  }
};


