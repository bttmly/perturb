"use strict";

var path = require("path");

function withoutExt (file) {
  return file.slice(0, -1 * path.extname(file).length);
}

module.exports = withoutExt;
