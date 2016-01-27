"use strict";

// TODO "match" isn't really the right word any more -- it's a handler for a single source file.

var I = require("immutable");
var fs = require("fs-extra");
var async = require("async");
var esprima = require("esprima");
var escodegen = require("escodegen");
var assign = require("object-assign");

var shouldSkip = require("./skip");
var mutators = require("./mutators");
var JS_TYPES = require("./constants/js-types");

function nodeWillReceiveMutations (node) {
  return mutators.mutatorsExistForNodeType(node.type);
}

var ESPRIMA_SETTINGS = {
  loc: true,
  comment: true,
};

var ENC_UTF8 = {
  encoding: "utf8",
};

var R = require("ramda");

module.exports = function makeMutants (match) {

  const {source, tests} = match;
  const sourceCode = fs.readFileSync(source, ENC_UTF8);
  const __ast = esprima.parse(sourceCode, ESPRIMA_SETTINGS);
  const ast = I.fromJS(__ast);
  const paths = getMutationPaths(__ast);

  const regeneratedSource = escodegen.generate(__ast);

  return paths.reduce(function (mutations, path) {
    return mutations.concat(mutationsFromPath(path));
  }, [])

  function mutationsFromPath (path) {
    const node = ast.getIn(path);
    return mutators.getMutatorsForNode(node) // could pass in path and AST here as well
      .filter(makeFilter(node))
      .map(function ({mutator, name}) {
        const updatedAst = ast.updateIn(path, mutator);
        return { 
          tests, source, name, path, mutator,
          loc: node.get("loc"),
          ast: updatedAst, 
          runner: match.runner,
          sourceCode: regeneratedSource,
          mutatedSourceCode: escodegen.generate(updatedAst.toJS()),
        };
      });
  }

}


function getMutationPaths (ast) {
  var mutationPaths = [];
  
  traverseWithPath(ast, function (node, path) {
    if (Array.isArray(node)) return true;
    if (shouldSkip(node, path)) return false;

    // useful for catching cases we missed on accidentally recursing on non-node objects
    if (typeof node.type !== "string") {
      console.log("-----------------------");
      console.log("NON STRING NODE TYPE");
      console.log(typeof node.type, node.type);
      console.log(node);
      console.log("-----------------------");
    }

    if (nodeWillReceiveMutations(node)) mutationPaths.push(path);
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
function traverseWithPath (tree, visitor, currentPath) {
  currentPath = currentPath || [];

  // TODO beware, this allows the "value" property of a RegExp
  // literal node through for recursion
  if (tree && typeof tree === JS_TYPES.obj) {

    // callback should return falsy to skip node
    if (!visitor(tree, currentPath.slice())) return;

    Object.keys(tree).forEach(function (key) {
      currentPath.push(key);
      traverseWithPath(tree[key], visitor, currentPath);
      currentPath.pop();
    });
  }
}

function makeFilter (node) {
  return function (entry) {
    if (entry.filter == null || entry.filter(node)) return true;
  };
}

