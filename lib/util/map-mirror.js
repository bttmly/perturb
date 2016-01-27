"use strict";

function mapMirror (input) {
  var keys = Array.isArray(input) ? input : Object.keys(input);
  return Object.freeze(
    keys.reduce(function (result, str) {
      if (typeof str !== "string") {
        throw new TypeError("Accepts only strings, found " + str + " (" + typeof str + ").");
      }
      result[str] = str;
      return result;
    }, Object.create(null))
  );
}

module.exports = mapMirror;
