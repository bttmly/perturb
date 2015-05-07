"use strict";

var pick = require("lodash.pick");

// todo -- copy code that will be repurposed out then delete this file
var deadUtil = {
  // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
  escapeForRegex: function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  endsWithRe: function (str, flags) {
    str = deadUtil.escapeForRegex(str);
    flags = flags || "";
    return new RegExp(str + "$");
  },

  startsWithRe: function (str, flags) {
    str = deadUtil.escapeForRegex(str);
    flags = flags || "";
    return new RegExp("^" + str);
  },

  objFilterUndefined: function (obj) {
    return pick(obj, function (val) {
      return val !== undefined;
    });
  },

  hrtimeToSeconds: function (hrtime) {
    return (hrtime[0] * 1e9 + hrtime[1]) / 1e6;
  },


  StringEnum: function (arr) {
    var cache = {};

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

  tryCall: function (fnToCall, cb) {
    var result, error;
    try {
      result = fnToCall();
    } catch (e) {
      error = e;
    }
    cb(error, result);
  },


  callWithArgs: function () {
    var args = [].slice.call(arguments);
    return function (fn) {
      return fn.apply(this, args);
    };
  },
};

module.exports = deadUtil;
