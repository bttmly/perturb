import R = require("ramda");
import estraverse = require("estraverse");

import CommentManager = require("./comments");

type PluginService = (n: ESTree.Node) => MutatorPlugin[]

// one nice thing about this is that the plugins that are returned
// originate with the MutatorFinder argument, which simplifies testing
function locateMutants (mutatorsForNode: PluginService, ast: ESTree.Node): MutantLocation[] {
  const mutantLocations: MutantLocation[] = [];
  const manager = new CommentManager();

  estraverse.traverse(ast, {
    enter (node: ESTree.Node) {
      manager.applyLeading(node);
      const path: string[] = this.path();
      const locations = mutatorsForNode(node)
        .filter(plugin => manager.isEnabled(plugin.name))
        .filter(plugin => plugin.filter == null || plugin.filter(node))
        .map(plugin => ({node, path, mutator: plugin}));

      mutantLocations.push(...locations);
    },
    leave (node: ESTree.Node) {
      manager.applyTrailing(node);
    }
  });
  return mutantLocations;
}

export = R.curry(locateMutants);