const R = require("ramda");
const fs = require("fs-extra");
const esprima = require("esprima");
const escodegen = require("escodegen");
const estraverse = require("estraverse");

const shouldSkip = require("./skippers");
const { getMutatorsForNode, hasAvailableMutations } = require("./mutators");

import {
  Mutant,
  Match,
  MutatorPlugin
} from "./types";

const ESPRIMA_SETTINGS = {
  loc: true,
  comment: true,
};

const FS_SETTINGS = {
  encoding: "utf8",
};

module.exports = function makeMutants (match: Match): Mutant[] {
  const {source, tests} = match;
  const {ast, code} = parse(source);
  const paths: Path[] = getMutationPaths(ast).map(p => p.map(String));

  // we regenerate the source code here to make it easy for diffing
  const originalSourceCode = escodegen.generate(ast);
  return R.chain(mutationsFromPath, paths);

  function mutationsFromPath (path: Path): Mutant[] {
    const node = <ESTree.Node>R.path(path, ast);
    return getMutatorsForNode(node)
      .filter(mutatorFilterFromNode(node))
      .map(function (m: MutatorPlugin) {
        // this can be done more elegantly with Ramda lenses, probably
        const newNode = m.mutator(node);
        const updatedAst = R.assocPath(path, newNode, ast);
        const mutatedSourceCode = escodegen.generate(updatedAst);

        // both the original source and the mutated source are present here
        // to avoid unnecessary extra code generation in mutator prep/teardown,
        // and also in reporters

        return <Mutant>{
          sourceFile: source,
          testFiles: tests,
          path: path,
          mutatorName: m.name,
          astAfter: updatedAst,
          astBefore: ast,
          loc: node.loc,
          originalSourceCode: originalSourceCode,
          mutatedSourceCode: mutatedSourceCode,
        };
      });
  }
}

type Path = Array<string>;

function getMutationPaths (ast: ESTree.Node) {
  const mutationPaths: Path[] = [];
  estraverse.traverse(ast, {
    enter: function (node: ESTree.Node) {
      const path = <Path>this.path();
      if (shouldSkip(node, path)) {
        return this.skip();
      }

      if (hasAvailableMutations(node)) {
        mutationPaths.push(path)
      }
    },
  });
  return mutationPaths;
}

function mutatorFilterFromNode (node: ESTree.Node) {
  return function (mutator: MutatorPlugin): boolean {
    if (mutator.filter == null) return true;
    if (mutator.filter(node)) return true;
    return false;
  };
}

interface _ParseResult {
  ast: ESTree.Node;
  code: string;
}

function parse (source: string): _ParseResult {
  console.log("reading", source, "...");
  const originalSource = fs.readFileSync(source).toString();

  let ast : ESTree.Node;
  try {
     ast = esprima.parse(originalSource, ESPRIMA_SETTINGS);
  } catch (err) {
    // TODO -- better error handling here
    console.log("ERROR PARSING SOURCE FILE", source);
    throw err;
  }

  const code = escodegen.generate(ast);
  return { ast, code }
}
