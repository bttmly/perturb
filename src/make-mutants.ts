const R = require("ramda");

import fs = require("fs-extra");
import esprima = require("esprima");
import escodegen = require("escodegen");
import estraverse = require("estraverse");

import shouldSkip = require("./skippers");
import updateIn = require("./util/update-in");
const { getMutatorsForNode, hasAvailableMutations } = require("./mutators");

const ESPRIMA_SETTINGS = {
  loc: true,
  comment: true,
};

const FS_SETTINGS = {
  encoding: "utf8",
};

function makeMutants (match: Match): Mutant[] {
  const { source, tests } = match;
  const { ast, code } = parse(source);
  const paths: Path[] = getMutationPaths(ast).map(p => p.map(String));

  // we regenerate the source code here to make it easy for diffing
  const originalSourceCode = escodegen.generate(ast);
  return R.chain(mutantsFromPath, paths);

  function mutantsFromPath (path: Path): Mutant[] {
    const node = <ESTree.Node>R.path(path, ast);
    return R.pipe(
      R.filter(mutatorFilterFromNode(node)),
      R.chain(function (m: MutatorPlugin) {
        
        return toArray(m.mutator(node)).map(function (newNode) {
          const updatedAst = updateIn(path, newNode, ast);
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
      })
     )(getMutatorsForNode(node));
  }
}

type Path = string[];

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

function parse (source: string) {
  const originalSource = fs.readFileSync(source).toString();
  try {
    const ast: ESTree.Node = esprima.parse(originalSource, ESPRIMA_SETTINGS);
    const code: string = escodegen.generate(ast);
    return { ast, code };
  } catch (err) {
    // TODO -- better error handling here
    console.log("ERROR PARSING SOURCE FILE", source);
    throw err;
  }
}

const toArray = x => Array.isArray(x) ? x : [x];

export = makeMutants;
