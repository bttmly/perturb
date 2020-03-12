import * as escodegen from "escodegen";
import updateIn from "./util/update-in";
import flatMap from "./util/flatMap";
import * as ESTree from "estree";
import { ParsedMatch, Mutant, MutantLocation } from "./types";

// (Match -> Location[])
// (Location -> Node[])
// (Node -> Mutant)

export default function makeMutants(pm: ParsedMatch): Mutant[] {
  const sourceFile = pm.source;
  const testFiles = pm.tests;
  const ast = pm.ast;
  const sourceCode = pm.code;

  function mapper({ node, mutator, path }: MutantLocation): Mutant[] {
    const newNodes = toArray(mutator.mutator(node));

    // should rename "mutator" to "mutate" maybe? verb is probably better as function name
    return newNodes.map(newNode => {
      const updatedAst: ESTree.Node = updateIn(path, newNode, ast);

      // both the original source and the mutated source are present here
      // to avoid unnecessary extra code generation in mutator prep/teardown,
      // and also in reporters

      return {
        sourceFile,
        testFiles,
        path,
        mutatorName: mutator.name,
        astAfter: updatedAst,
        astBefore: ast,
        loc: node.loc!,
        originalSourceCode: sourceCode,
        mutatedSourceCode: escodegen.generate(updatedAst),
      };
    });
  }
  return flatMap(pm.locations, mapper)
}

const toArray = (x: any) => (Array.isArray(x) ? x : [x]);
