"use strict";

// TODO "match" isn't really the right word any more -- it's a handler for a single source file.

const I = require("immutable");
const R = require("ramda");
const fs = require("fs-extra");
const async = require("async");
const esprima = require("esprima");
const escodegen = require("escodegen");
const assign = require("object-assign");

const shouldSkip = require("./skip");
const mutators = require("./mutators");
const JS_TYPES = require("./constants/js-types");

function nodeWillReceiveMutations (node) {
  return mutators.mutatorsExistForNodeType(node.type);
}

const ESPRIMA_SETTINGS = {
  loc: true,
  comment: true,
};

const ENC_UTF8 = {
  encoding: "utf8",
};

module.exports = function makeMutations (match) {

  const {source, tests} = match;
  const {ast, paths, code} = parse(source);

  return R.chain(mutationsFromPath, paths);

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
          sourceCode: code,
          mutatedSourceCode: escodegen.generate(updatedAst.toJS()),
        };
      });
  }

}


function getMutationPaths (ast) {
  const mutationPaths = [];
  
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

function parse (source) {
  const sourceCode = fs.readFileSync(source, ENC_UTF8);
  let __ast;

  try {
    __ast = esprima.parse(sourceCode, ESPRIMA_SETTINGS);
  } catch (err) {
    console.log(sourceCode);
    throw err;
  }

  return {
    ast: I.fromJS(__ast),
    paths: getMutationPaths(__ast),
    code: escodegen.generate(__ast),
  };
}
