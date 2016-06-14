"use strict";

var util = require("util");

var assign = require("object-assign");

function FmtError () {
  // because `new` agnostic, variadic constructors are tricky
  var err = Object.create(FmtError.prototype);
  err.message = util.format.apply(null, arguments);
  Error.captureStackTrace(err, FmtError);
  return err;
}

util.inherits(FmtError, Error);

FmtError.prototype.assign = function (extraData) {
  assign(this, extraData);
  return this;
};

module.exports = FmtError;
