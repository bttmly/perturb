"use strict";

function invalidateRequireCache (predicate) {
  Object.keys(require.cache).forEach(function (modulePath) {
    if (predicate(modulePath)) {
      console.log("deleting", modulePath);
      delete require.cache[modulePath];
    }
  });
}

module.exports = invalidateRequireCache;
