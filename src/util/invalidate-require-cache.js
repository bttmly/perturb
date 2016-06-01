"use strict";

function invalidateRequireCache (predicate) {
  var count = 0;
  Object.keys(require.cache).forEach(function (modulePath) {
    if (predicate(modulePath)) {
      count++;
      delete require.cache[modulePath];
    }
  });
  // console.log("invalidated " + count + " modules from require cache");
}

module.exports = invalidateRequireCache;
