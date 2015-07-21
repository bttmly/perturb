"use strict";

var path = require("path");
var fs = require("fs-extra");

function dirFullPaths (relativeDir) {
  return fs.readdirSync(path.join(__dirname, relativeDir))
    .map(function (p) {
      return path.join(__dirname, relativeDir, p);
    });
}

function wrap (code, absPath) {
  return "(function () {\n" +
    // "console.log('" + absPath + "')\n" +
    code + "\n})();\n";
}

var fullPaths = dirFullPaths("./test-files");

fullPaths = fullPaths.slice(9);

var js = fullPaths.reduce(function (code, absPath) {
  return code + wrap(fs.readFileSync(absPath), absPath);
}, "");

fs.removeSync(path.join(__dirname, "test"));
fs.mkdirSync(path.join(__dirname, "test"));
fs.writeFileSync(path.join(__dirname, "test", "test.js"), js);
