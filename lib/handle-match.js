"use strict";

var I = require("immutable");
var fs = require("fs-extra");
var async = require("async");
var esprima = require("esprima");
var escodegen = require("escodegen");
var assign = require("object-assign");

var partial = require("lodash.partial");
var flatten = require("lodash.flatten");

var pkgUtil = require("./pkg-util");
var shouldSkip = require("./skip");
var constants = require("./constants");
var runMutation = require("./run-mutation");
var mutators = require("./mutators");

var JS_TYPES = constants.JS_TYPES;

var ESPRIMA_SETTINGS = pkgUtil.constObj({
  loc: true,
  comment: true
});

var ENC_UTF8 = pkgUtil.constObj({
  encoding: "utf8"
});

function handleMatch (match, done) {

  var config = global.__perturb__;

  async.parallel({
    sourceCode: partial(fs.readFile, match.sourceFile, ENC_UTF8),
    testCode: partial(fs.readFile, match.testFile, ENC_UTF8)
  }, function (err, result) {

    if (err) return done(err);

    var mutableAst = esprima.parse(result.sourceCode, ESPRIMA_SETTINGS);
    var immutableAst = I.fromJS(mutableAst);

    var base = {
      sourceFile: match.sourceFile,
      testFile: match.testFile,
      sourceCode: result.sourceCode,
      genSourceCode: escodegen.generate(mutableAst)
    };

    var mutationPaths = getMutationPaths(mutableAst);

    var mutations = flatten(mutationPaths.map(mutationsFromPath(base, immutableAst)));

    function finish (err, mutations) {

      if (err) {
        console.log("async map series halting with error", err);
        return done(err);
      }

      done(null, {
        sourceFile: match.sourceFile,
        testFile: match.testFile,
        mutations: mutations
      });
    }

    async.mapSeries(mutations, function (mutant, next) {
      runMutation(mutant, config.mutantReporter, next);
    }, finish);

  });
}

function getMutationPaths (ast) {
  var mutationPaths = [];
  traverseWithPath(ast, function (node, path) {
    // what if we visit a "node" that's actually an array of nodes?
    // (it has no type)
    if (shouldSkip(node, path)) return;

    if (Array.isArray(node)) return true;

    if (!node.type) console.log(node, typeof node, node instanceof RegExp);

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

  // TODO this falls down on RegExp literals
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
        var code = escodegen.generate(updatedAst.toJS());
        return assign({
          ast: updatedAst,
          loc: node.get("loc"),
          name: entry.name,
          mutSourceCode: code
        }, data);
      });
  };
}

function makeFilter (node) {
  return function (entry) {
    if (entry.filter === undefined || entry.filter(node)) return true;
  }
}

module.exports = handleMatch;
