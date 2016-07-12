const esprima = require("esprima");
const R = require("ramda");

const { getMutatorByName } = require("../built/mutators");
const { Syntax } = require("estraverse");

function isPrimitiveValue (value) {
  return Object(value) !== value;
}

function objIsShallow (obj) {
  if (isPrimitiveValue(obj)) return false;
  return Object.keys(obj).every(function (key) {
    return isPrimitiveValue(obj[key]);
  });
}

function makeNodeOfType (type, props = {}) {
  if (!(type in Syntax)) throw new Error("Invalid node type " + type);
  return R.merge({type}, props);
}

function nodeFromCode (code) {
  const ast = esprima.parse(code);
  if (ast.body.length !== 1) {
    throw new Error("Rendered AST did not have exactly one node");
  }
  return ast.body[0];
}

// standard PerturbConfig for tests
function makeConfig () {
  return {
    mutators: [],
    skippers: [],
    reporter: "",
    matcher: "",
    runner: "",

    projectRoot: "/code/project",
    perturbDir: ".perturb",
    sourceDir: "lib",
    testDir: "test",

    sourceGlob: "/**/*.js",
    testGlob: "/**/*.js",
  }
}

function mutatorByName (name) {
  const m = getMutatorByName(name);
  if (m == null) throw new Error(`No mutator found for ${name}`);
  return m;
}

function applyMutation (node, name) {
  return mutatorByName("tweak-object-literal").mutator(node);
}

module.exports = {
  makeConfig,
  objIsShallow,
  makeNodeOfType,
  nodeFromCode,
  mutatorByName,
  applyMutation,
};
