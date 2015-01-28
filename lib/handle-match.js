"use strict";

var I = require("immutable");
var fs = require("fs-extra");
var async = require("async");
var esprima = require("esprima");
var last = require("lodash.last");
var escodegen = require("escodegen");
var assign = require("object-assign");

var partial = require("lodash.partial");
var some = require("lodash.some");

var runMutation = require("./run-mutation");
var getMutatorForNode = require("./mutators");
var util = require("./util");
var constants = require("./constants");

var NODE_TYPES = constants.NODE_TYPES;
var JS_TYPES = constants.JS_TYPES;

// called on nodes during labeling to skip
var SKIP_TRAVERSE = {
  skipByKey: (function () {
    var KEYS_TO_SKIP = util.constObj({
      "loc": true
    });
    return function skipByKey (_, path) {
      return (last(path) in KEYS_TO_SKIP);
    };
  })(),

  skipRequire: function skipRequire (node) {
    return (
      node.type === NODE_TYPES.CallExpression &&
      node.callee.name === "require"
    );
  },

  skipeUseStrict: function skipUseStrict (node) {
    return (
      node.type === NODE_TYPES.ExpressionStatement &&
      node.expression.value === "use strict"
    );
  }
};

var ESPRIMA_SETTINGS = util.constObj({
  loc: true,
  comment: true
});

var ENC_UTF8 = util.constObj({
  encoding: "utf8"
});

function mutantReporter (mutant) {
  console.log(util.prettyPrintMutant(mutant));
}


module.exports = handleMatch;
function handleMatch (match, done) {
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
    var mutations = mutationPaths.map(partial(mutationFromPath, base, immutableAst));

    function finish (err, mutations) {
      if (err) return done(err);
      done(null, {
        sourceFile: match.sourceFile,
        testFile: match.testFile,
        mutations: mutations
      });
    }

    async.mapSeries(mutations, function (mutant, next) {
      runMutation(mutant, mutantReporter, next);
    }, finish);

  });
}

function getMutationPaths (ast) {
  var mutationPaths = [];
  traverseWithPath(ast, function (node, path) {
    if (some(SKIP_TRAVERSE, function (fn) {
      return fn(node, path);
    })) return false;

    if (getMutatorForNode(node)) mutationPaths.push(path);
  });
  return mutationPaths;
}

// expects a mutable tree
// callback can alter the tree in place
// useful for mutating the AST in place before making it immutable
function traverseWithPath (tree, cb, currentPath) {
  currentPath = currentPath || [];
  if (tree && typeof tree === JS_TYPES.obj) {
    if (cb(tree, currentPath.slice()) === false) return;
    Object.keys(tree).forEach(function (key) {
      currentPath.push(key);
      traverseWithPath(tree[key], cb, currentPath);
      currentPath.pop();
    });
  }
}

function mutationFromPath (obj, iAst, path) {
  var node = iAst.getIn(path);
  var mutator = getMutatorForNode(node);
  var newIAst = iAst.updateIn(path, mutator);

  var mAst = newIAst.toJS();

  // try {
  //   var code = escodegen.generate(mAst);
  // } catch (err) {
  //   console.log(node.get("loc"));
  //   console.log(mutator.name);
  //   console.log(JSON.stringify(node.toJS(), null, 4));
  //   throw err;
  // }

  var code = escodegen.generate(mAst);

  return assign({
    ast: newIAst,
    loc: node.get("loc"),
    name: mutator.name,
    mutSourceCode: code
  }, obj);
}
