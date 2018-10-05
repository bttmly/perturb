const esprima = require("esprima");
const escodegen = require("escodegen");
const R = require("ramda");
const expect = require("expect");
const estraverse = require("estraverse");
const updateIn = require("../lib/util/update-in").default;

const ESPRIMA_OPTIONS = {
  attachComment: true,
  comments: true,
  loc: true,
};

const { getMutatorByName } = require("../lib/mutators");
const { Syntax } = require("estraverse");

function nodeFromCode(code) {
  const ast = esprima.parse(code, ESPRIMA_OPTIONS);
  if (ast.body.length !== 1) {
    throw new Error("Rendered AST did not have exactly one node");
  }
  return ast.body[0];
}

// standard PerturbConfig for tests
function makeConfig() {
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
  };
}

function mutatorByName(name) {
  const m = getMutatorByName(name);
  if (m == null) throw new Error(`No mutator found for ${name}`);
  return m;
}

function nodeFilter(plugin, node) {
  if (plugin.filter == null) return true;
  return plugin.filter(node);
}

function makeMutationTester(name) {
  return function({ xdescr, descr, before, after, log, noMatch }) {
    if (xdescr) {
      xit(xdescr, () =>
        mutateAndCompare({ before, after, name, log, noMatch }),
      );
      return;
    }

    it(descr, () => mutateAndCompare({ before, after, name, log, noMatch }));
  };
}

const EMPTY_PATH = [];
const GEN_OPTS = {
  format: {
    compact: true,
  },
};
function mutateAndCompare({ before, after, name, log, noMatch }) {
  if (before == null) {
    throw new Error("Must provide before!");
  }

  if (after == null && !noMatch) {
    throw new Error("Must provide after, or specify :noMatch");
  }

  before = String(before);
  if (!Array.isArray(after)) after = String(after);

  const ast = nodeFromCode(before);
  const paths = [];
  const plugin = mutatorByName(name);
  estraverse.traverse(ast, {
    enter(node) {
      // console.log("enter", node.type, plugin.nodeTypes.includes(node.type), nodeFilter(plugin, node));
      if (plugin.nodeTypes.includes(node.type) && nodeFilter(plugin, node)) {
        paths.push(this.path());
      }
    },
  });

  if (paths.length === 0) {
    if (noMatch) {
      // console.log('expected no matches, ok!')
      return;
    }
    throw new Error(`No paths found for ${name} in ${before}`);
  }

  if (paths.length > 1) {
    throw new Error(`Multiple paths found for ${name} in ${before}`);
  }

  // null path if top, so pass empty array;
  const path = paths.shift() || EMPTY_PATH;
  const node = R.path(path, ast);

  const mut = plugin.mutator(node);

  if (Array.isArray(mut)) {
    if (!Array.isArray(after)) {
      throw new Error(
        "if mutator returns multiple, after must be an array" + after,
      );
    }

    const uniqued = [...new Set(after)];
    if (uniqued.length !== after.length) {
      throw new Error("Passed duplicate strings in `after` array");
    }

    const newCodes = new Array(mut.length)
      .fill(ast)
      .map(
        (ast, i) =>
          path === EMPTY_PATH ? mut[i] : updateIn(path, mut[i], ast),
      )
      .map(newAst => escodegen.generate(newAst, GEN_OPTS));

    expect(after.length).toEqual(newCodes.length);

    after.every(function(single) {
      expect(newCodes).toContain(single);
    });

    return;
  }

  if (log) {
    console.log(plugin.name, ":", escodegen.generate(mut), path);
  }

  // if we had an empty path, the new node is the new AST
  const newAst = path === EMPTY_PATH ? mut : updateIn(path, mut, ast);
  const result = escodegen.generate(newAst, GEN_OPTS);
  expect(result).toEqual(after);
}

module.exports = {
  makeConfig,
  nodeFromCode,
  mutatorByName,
  mutateAndCompare,
  makeMutationTester,
};
