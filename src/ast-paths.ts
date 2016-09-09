import R = require("ramda");
import estraverse = require("estraverse");

import CommentManager = require("./comments");

// one nice thing about this is that the plugins that are returned
// originate with the MutatorFinder argument, which simplifies testing
function getMutantLocations (finder: MutatorFinder, ast: ESTree.Node): MutantLocation[] {
  const mutantLocations: MutantLocation[] = [];
  const manager = new CommentManager();

  estraverse.traverse(ast, {
    enter (node: ESTree.Node) {
      manager.applyLeading(node);
      mutantLocations.push(...applyVisitor(node, this, manager, finder));
    },
    leave (node: ESTree.Node) {
      manager.applyTrailing(node);
    }
  });
  return mutantLocations;
}

// No typings for estraverse.Controller :/
function applyVisitor (node: ESTree.Node, controller: any, manager: CommentManager, finder: MutatorFinder): MutantLocation[] {
  const path : string[] = controller.path();
  return finder(node)
    .filter(plugin => manager.isEnabled(plugin.name))
    .filter(plugin => plugin.filter == null || plugin.filter(node))
    .map(plugin => ({node, path, mutator: plugin}))
}

export = R.curry(getMutantLocations);
