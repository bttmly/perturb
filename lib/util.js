"use strict";

var assign = require("object-assign");
var chalk = require("chalk");

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
    return(Object.freeze(assign(util.blank(), obj)));
  },

  StringEnum: function (arr) {
    var cache = util.mapMirror(arr);
    var enumFunc = function (value) {
      if (!enumFunc.test(value)) {
        throw new TypeError("Value '" + value + "' not included in Enum[" + arr.toString() + "]");
      }
    };
    enumFunc.test = function (value) {
      return !!cache[value];
    };
    return enumFunc;
  },
  
  prettyPrintDiff: function (mutation) {
    console.log(mutation.name);
    if (!mutation.loc || !mutation.diff) return;
    var line = mutation.loc.start.line;
    console.log("line " + line);
    mutation.diff.forEach(function (entry) {
      var color = entry.added ? "green" : "red";
      console.log(chalk[color](entry.value.slice(0, -1)));
    });
    console.log("");
  }
};


