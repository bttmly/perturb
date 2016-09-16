const esprima = require("esprima");
const escodegen = require("escodegen");
const R = require("ramda");
const expect = require("expect");
const estraverse = require("estraverse");
const updateIn = require("../built/util/update-in");

const ESPRIMA_OPTIONS = {
  attachComment: true,
  comments: true,
  loc: true,
};

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
  const ast = esprima.parse(code, ESPRIMA_OPTIONS);
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
  if (node == null) {
    throw new Error("Passed a nil node");
  }

  const plugin = mutatorByName(name)

  if (!plugin.nodeTypes.includes(node.type)) {
    throw new Error(`Wrong node type - actual: ${node.type}, allowed: ${plugin.nodeTypes}`);
  }

  if (plugin.filter && !plugin.filter(node)) {
    console.log("filter returned false!");
    return node;
  }
  return plugin.mutator(node);
}

function nodeFilter (plugin, node) {
  if (plugin.filter == null) return true;
  return plugin.filter(node);
}

function testPlugin (name) {
  return function ({xdescr, descr, before, after, log}) {
    if (xdescr) {
      xit(xdescr, () => mutateAndCompare({before, after, name, log}));
      return;
    }

    it(descr, () => mutateAndCompare({before, after, name, log}))
  }
}

const EMPTY_PATH = []
const GEN_OPTS = {
  format: {
    compact: true,
  },
};
function mutateAndCompare ({before, after, name, log}) {
  if (before == null) {
    throw new Error("Must provide before!");
  }

  if (after == null) {
    throw new Error("Must provide after!");
  }

  before = String(before);
  if (!Array.isArray(after)) after = String(after);

  const ast = nodeFromCode(before);
  const paths = [];
  const plugin = mutatorByName(name);
  estraverse.traverse(ast, {
    enter (node) {
      // console.log("enter", node.type, plugin.nodeTypes.includes(node.type), nodeFilter(plugin, node));
      if (plugin.nodeTypes.includes(node.type) && nodeFilter(plugin, node)) {
        paths.push(this.path());
      }
    },
  })

  if (paths.length === 0) {
    if (before === after) {
      return;
    }
    throw new Error(`No paths found for ${name} in ${before}`);
  }

  if (paths.length > 1) {
    throw new Error(`Multiple paths found for ${name} in ${before}`)
  }

  // null path if top, so pass empty array;
  const path = paths.shift() || EMPTY_PATH;
  const node = R.path(path, ast);

  // TODO -- handle if this returns an array of mutations
  const mut = plugin.mutator(node)

  if (Array.isArray(mut)) {
    if (!Array.isArray(after)) {
      throw new Error("if mutator returns multiple, after must be an array" + after);
    }

    const uniqued = [...new Set(after)];
    if (uniqued.length !== after.length) {
      throw new Error("Passed duplicate strings in `after` array");
    }

    const newCodes = new Array(mut.length)
      .fill(ast)
      .map((ast, i) => path === EMPTY_PATH ? mut[i] :  updateIn(path, mut[i], ast))
      .map(newAst => escodegen.generate(newAst, GEN_OPTS));

    after.every(function (single) {
      expect(newCodes).toContain(single);
    });
    return;
  }

  if (log) {
    console.log(plugin.name, ":", escodegen.generate(mut), path);
  }

  // if we had an empty path, the new node is the new AST
  const newAst = path === EMPTY_PATH ? mut :  updateIn(path, mut, ast);
  const result = escodegen.generate(newAst, GEN_OPTS);
  expect(result).toEqual(after);
}

// function mutateAndCompare ({before, after, name, path, log}) {
//   const ast = nodeFromCode(before);
//   if (log) console.log(R.path(path, ast));
//   const mut = applyMutation(R.path(path, ast), name);
//   const result = escodegen.generate(R.assocPath(path, mut, ast))
//   expect(result).toEqual(after);
// }

module.exports = {
  makeConfig,
  objIsShallow,
  makeNodeOfType,
  nodeFromCode,
  mutatorByName,
  applyMutation,
  mutateAndCompare,
  testPlugin,
};
