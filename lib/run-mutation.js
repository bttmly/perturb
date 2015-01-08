"use strict";

var fs = require("fs-extra");
var escodegen = require("escodegen");
var Mocha = require("mocha");
var diff = require("diff");

var handlers = require("./mocha-handlers");

/*
[ 'ast',
  'loc',
  'mutation',
  'sourceFile',
  'testFile',
  'sourceCode',
  'genSourceCode' 
  'mutSourceCode'
  ]

*/

module.exports = function runMutation (mutation, done) {
  
  var counters = {
    passed: [],
    failed: []
  };
  
  var mocha = new Mocha({reporter: handlers.reporter(counters)});

  console.log(mutation.name);
  // console.log(mutation.mutSourceCode);
  // console.log("\n");

  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);
  mocha.addFile(mutation.testFile);
  mocha.run(function (failures) {
    done(null, counters);
  });


};

// function diff (mutation) {
//   diff.diffLines(mutation.ast.toJS()
// }