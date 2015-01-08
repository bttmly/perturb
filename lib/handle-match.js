
var I = require("immutable");
var fs = require("fs-extra");
var async = require("async");
var esprima = require("esprima");
var escodegen = require("escodegen");

var partial = require("lodash.partial");
var assign = require("object-assign");

// var intercept = require("intercept-require");

var runMutation = require("./run-mutation");
var mutators = require("./mutators");
var util = require("./util");

var ESPRIMA_SETTINGS = util.constObj({
  loc: true,
  comment: true
});

var NO_TRAVERSE = util.constObj({
  "loc": true
});

function handleMatch (match, done) {

  async.parallel({
    sourceCode: fs.readFile.bind(null, match.sourceFile, {encoding: "utf8"}),
    testCode: fs.readFile.bind(null, match.testFile, {encoding: "utf8"})
  }, function (err, r) {
    if (err) return done(err);

    var mutableAst = esprima.parse(r.sourceCode, ESPRIMA_SETTINGS);
    var immutableAst = I.fromJS(mutableAst);

    var base = {
      sourceFile: match.sourceFile,
      testFile: match.testFile,
      sourceCode: r.sourceCode,
      genSourceCode: escodegen.generate(mutableAst)
    };

    var mutationPaths = getMutationPaths(mutableAst);
    var mutations = mutationPaths.map(partial(mutationFromPath, base, immutableAst));
    var results = mutations.map(runMutation);

    done(null, results);
  });

  // start require() interception
  // looking for original relative path

  // find and parse source code
  // generate a list of mutations
  
  // for each mutation
    // write it to the source file
    // run the test file
      // if require() interceptor is hit, provide the mutated file
    // collect errors

  // write original source back to file
  // pass errors out
}

function getMutationPaths (ast) {
  var mutationPaths = [];
  traverseWithPath(ast, function (node, path) {
    if (last(path) in NO_TRAVERSE) {
      return false;
    }

    if (mutators(node)) {
      mutationPaths.push(path);
    }
  });
  return mutationPaths;
}

function last (arr) {
  return arr[arr.length - 1];
}

// expects a mutable tree
// callback can alter the tree in place
// useful for mutating the AST in place before making it immutable
function traverseWithPath (tree, cb, currentPath) {
  if (currentPath == null) {
    currentPath = [];
  }

  if (tree && typeof tree === "object") {
    // return false from cb to skip recurse
    if (cb(tree, currentPath.slice()) === false) {
      return;
    }

    Object.keys(tree).forEach(function (key) {
      currentPath.push(key);
      traverseWithPath(tree[key], cb, currentPath);
      currentPath.pop();
    });
  }
}

function mutationFromPath (obj, iAst, path) {
  var node = iAst.getIn(path);
  var mutator = mutators(node);
  var newIAst = iAst.updateIn(path, mutator);

  return assign({
    ast: newIAst,
    loc: node.get("loc"),
    mutation: mutator.name,
    mutSourceCode: escodegen.generate(newIAst.toJS())
  }, obj);
}

module.exports = handleMatch;