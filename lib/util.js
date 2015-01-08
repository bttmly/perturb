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
  
  arrayToKeyMirror: function (arr) {
    return arr.reduce(function (result, str) {
      if (typeof str !== "string") {
        throw new TypeError("Needs a string");
      }
      result[str] = str;
      return result;
    }, {});
  },

  blank: function () {
    return Object.create(null);
  },
  
  constObj: function (obj) {
    return(Object.freeze(assign(util.blank(), obj)));
  },
  
  prettyPrintDiff: function (mutation) {
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


