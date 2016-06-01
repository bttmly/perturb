"use strict";

function omitUndefined (target) {
  var out = {};
  Object.keys(target).forEach(function (key) {
    if (target[key] === undefined) return;
    out[key] = target[key];
  });
  return out;
}

module.exports = omitUndefined;
