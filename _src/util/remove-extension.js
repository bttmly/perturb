"use strict";

var extname = require("path").extname;

function removeExtension (filePath) {
  return filePath.slice(-1 * extname(filePath).length);
}

module.exports = removeExtension;
