"use strict";

var I = require("immutable");
var fs = require("fs-extra");
var async = require("async");
var esprima = require("esprima");
var escodegen = require("escodegen");
var assign = require("object-assign");

var partial = require("lodash.partial");
var flatten = require("lodash.flatten");

var shouldSkip = require("./skip");
var runMutant = require("./run-mutant");
var mutators = require("./mutators");
var constObj = require("./util/const-obj");
var handleError = require("./util/handle-error");
var JS_TYPES = require("./constant/js-types");


var ESPRIMA_SETTINGS = constObj({
  loc: true,
  comment: true,
});

var ENC_UTF8 = constObj({
  encoding: "utf8",
});

function createMatchHandler (config) {

  return function handleMatch (match, done) {

    var failedTest = false;

    function hasFailed () { return failedTest; }

    // need to iterate over the match.testFiles
    // until we have finished all of them OR one fails a test

    var h = handleError(done);

    async.parallel({
      sourceCode: partial(fs.readFile, match.sourceFile, ENC_UTF8),
      testCode: partial(fs.readFile, match.testFile, ENC_UTF8),
    }, h(function (result) {

      function revertToOriginalSource (next) {
        fs.writeFile(match.sourceFile, result.sourceCode, next);
      }

      var mutableAst = esprima.parse(result.sourceCode, ESPRIMA_SETTINGS);
      var immutableAst = I.fromJS(mutableAst);

      var base = {
        sourceFile: match.sourceFile,
        testFiles: match.testFiles,
        sourceCode: result.sourceCode,
        genSourceCode: escodegen.generate(mutableAst),
      };

      var mutants = flatten(
        getMutationPaths(mutableAst).map(mutationsFromPath(base, immutableAst))
      );

      var finish = h(function (processedMutants) {
        revertToOriginalSource(h(function () {
          done(null, {
            sourceFile: match.sourceFile,
            testFile: match.testFile,
            mutants: processedMutants,
          });
        }));
      });

      // TODO implement per-match reporting features

      console.log("***********************************************************");
      var test = match.testFile.split("/").pop();
      var source = match.sourceFile.split("/").pop();
      console.log("Beginning mutants from", source, "relative to", test, mutants.length);
      console.log("***********************************************************");

      async.mapSeries(mutants, runMutant(config), finish);

    }));
  };
}


function getMutationPaths (ast) {
  var mutationPaths = [];
  traverseWithPath(ast, function (node, path) {
    // first check if it is actually an array of nodes
    if (Array.isArray(node)) return true;

    // then apply skip functions
    if (shouldSkip(node, path)) return false;

    // useful for catching cases we missed on accidentally recursing on non-node objects
    if (typeof node.type !== "string") {
      console.log("-----------------------");
      console.log("NON STRING NODE TYPE");
      console.log(typeof node.type, node.type);
      console.log(node);
      console.log("-----------------------");
    }

    if (mutators.mutatorsExistForNodeType(node.type)) mutationPaths.push(path);
    return true;
  });
  return mutationPaths;
}

// expects a mutable tree
// callback can alter the tree in place
// useful for mutating the AST in place before making it immutable
//
// TODO - we need a safe iterative function to handle this to guarantee
// we don't blow the stack
//
function traverseWithPath (tree, cb, currentPath) {
  currentPath = currentPath || [];

  // TODO beware, this allows the "value" property of a RegExp
  // literal node through for recursion
  if (tree && typeof tree === JS_TYPES.obj) {

    // callback should return falsy to skip node
    if (!cb(tree, currentPath.slice())) return;

    Object.keys(tree).forEach(function (key) {
      currentPath.push(key);
      traverseWithPath(tree[key], cb, currentPath);
      currentPath.pop();
    });
  }
}

function mutationsFromPath (data, ast) {
  return function (path) {
    var node = ast.getIn(path);

    return mutators.getMutatorsForNode(node)
      .filter(makeFilter(node))
      .map(function (entry) {
        var updatedAst = ast.updateIn(path, entry.mutator);

        // this is useful for catching bad mutators in development
        // but obviously remove in prod.
        try {
          var code = escodegen.generate(updatedAst.toJS());
        } catch (err) {
          console.log("EXPLODED TRYING", entry.name);
          console.log(escodegen.generate(ast.getIn(path).toJS()));
          throw err;
        }

        return assign({
          ast: updatedAst,
          loc: node.get("loc"),
          name: entry.name,
          mutSourceCode: code,
        }, data);
      });
  };
}

function makeFilter (node) {
  return function (entry) {
    if (entry.filter == null || entry.filter(node)) return true;
  };
}

module.exports = createMatchHandler;
