"use strict";

function handleError (done) {
  return function (next) {
    return function (err) {
      if (err) return done(err);
      var len = arguments.length,
          args = new Array(len - 1),
          i = 1;
      for (; i < len; i++) args[i] = arguments[i];
      next.apply(null, args);
    };
  };
}

module.exports = handleError;
