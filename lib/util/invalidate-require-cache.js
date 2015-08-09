"use strict";

function invalidateRequireCache (predicate) {
  Object.keys(require.cache).forEach(function (modulePath) {
    if (predicate(modulePath)) {
      delete require.cache[modulePath];
    }
  });
}

module.exports = invalidateRequireCache;
