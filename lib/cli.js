"use strict";

var path = require("path");

var perturb = require("./");
var util = require("./util");

var exampleDir = path.join(__dirname, "../example");

perturb({sharedParent: exampleDir}, function (err, data) {
  if (err) throw err;
  console.log(data.meta);
  data.matches.forEach(function (match) {
    match.mutations
      .filter(util.mutantIsAlive)
      .map(util.prettyDiff)
      .forEach(function (str) {
        console.log(str);
      });
  });
});