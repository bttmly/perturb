const R = require("ramda");

import fs = require("fs-extra");
import esprima = require("esprima");
import escodegen = require("escodegen");
import estraverse = require("estraverse");

import applyNodeComments = require("./comments");
import mutators = require("./mutators");
import shouldSkip = require("./skippers");

import astPaths = require("./ast-paths");
import updateIn = require("./util/update-in");


const ESPRIMA_SETTINGS = {
  loc: true,
  comment: true,
  attachComment: true,
};

const FS_SETTINGS = {
  encoding: "utf8",
};

interface MutantLocation {
  mutator: MutatorPlugin;
  path: Path;
  node: ESTree.Node;
}

function makeMutants (getLocations, match: Match): Mutant[] {
  const { source, tests } = match;
  const { ast, code } = parse(match.sourceCode);
  const locations: MutantLocation[] = getLocations(ast);

  // we regenerate the source code here to make it easy for diffing
  const originalSourceCode = escodegen.generate(ast);
  return R.chain(mutantsFromLocation, locations);

  function mutantsFromLocation (location: MutantLocation): Mutant[] {
    const {node, mutator, path} = location;

    // should rename "mutator" to "mutate"? verb better as function name
    return toArray(mutator.mutator(node))
      .map(function (newNode) {
        const updatedAst = updateIn(path, newNode, ast);
        const mutatedSourceCode = escodegen.generate(updatedAst);

        // both the original source and the mutated source are present here
        // to avoid unnecessary extra code generation in mutator prep/teardown,
        // and also in reporters

        return <Mutant>{
          sourceFile: source,
          testFiles: tests,
          path: path,
          mutatorName: mutator.name,
          astAfter: updatedAst,
          astBefore: ast,
          loc: node.loc,
          originalSourceCode: originalSourceCode,
          mutatedSourceCode: mutatedSourceCode,
        };
      });
  }
}

type Path = string[];

function parse (source: string) {
  try {
    const ast: ESTree.Node = esprima.parse(source, ESPRIMA_SETTINGS);
    const code: string = escodegen.generate(ast);
    return { ast, code };
  } catch (err) {
    // TODO -- better error handling here
    console.log("ERROR PARSING SOURCE FILE", source);
    throw err;
  }
}

const last = arr => arr[arr.length - 1];
const toArray = x => Array.isArray(x) ? x : [x];

export = R.curry(makeMutants);
