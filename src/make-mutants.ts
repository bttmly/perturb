const R = require("ramda");

import esprima = require("esprima");
import escodegen = require("escodegen");

import astPaths = require("./ast-paths");
import updateIn = require("./util/update-in");

const ESPRIMA_SETTINGS = {
  loc: true,
  comment: true,
  attachComment: true,
};

interface MutantLocation {
  mutator: MutatorPlugin;
  path: string[];
  node: ESTree.Node;
}

type Locator = (n: ESTree.Node) => MutantLocation[];

function makeMutants (locator: Locator, match: Match): Mutant[] {
  const { source, tests } = match;
  const { ast, code } = parse(match.sourceCode);
  const locations = locator(ast);

  // we regenerate the source code here to make it easy for diffing
  const originalSourceCode = escodegen.generate(ast);
  
  const factory = makeMutantFactory(source, tests, ast, originalSourceCode);
  return R.chain(factory, locations);
}

function makeMutantFactory (sourceFile: string, testFiles: string[], ast: ESTree.Node, sourceCode: string) {
  return function (location: MutantLocation): Mutant[] {
    const {node, mutator, path} = location;

    // should rename "mutator" to "mutate"? verb better as function name
    return toArray(mutator.mutator(node))
      .map(function (newNode) {
        const updatedAst = updateIn(path, newNode, ast);

        // both the original source and the mutated source are present here
        // to avoid unnecessary extra code generation in mutator prep/teardown,
        // and also in reporters

        return <Mutant>{
          sourceFile, testFiles,
          path: path,
          mutatorName: mutator.name,
          astAfter: updatedAst,
          astBefore: ast,
          loc: node.loc,
          originalSourceCode: sourceCode,
          mutatedSourceCode: escodegen.generate(updatedAst),
        };
      });
  }
}

function parse (source: string) {
  try {
    const ast: ESTree.Node = esprima.parse(source, ESPRIMA_SETTINGS);
    const code: string = escodegen.generate(ast);
    return { ast, code };
  } catch (err) {
    // This really shouldn't happen -- we already ran the test suite and
    // presumably executed this file, so it should be valid JS.
    console.log("ERROR PARSING SOURCE FILE", source);
    throw err;
  }
}

const toArray = x => Array.isArray(x) ? x : [x];

export = R.curry(makeMutants);
