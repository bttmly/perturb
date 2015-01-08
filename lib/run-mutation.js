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

module.exports = function runMutation (mutation) {
  var mocha = new Mocha({reporter: handlers.reporter()});
  fs.writeFileSync(mutation.sourceFile, mutation.mutSourceCode);
  mocha.addFile(mutation.testFile);
  mocha.run(handlers.runner());
};

// function diff (mutation) {
//   diff.diffLines(mutation.ast.toJS()
// }