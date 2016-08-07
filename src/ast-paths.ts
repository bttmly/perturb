import R = require("ramda");
import estraverse = require("estraverse");

// TODO this should be injected somehow
import shouldSkip = require("./skippers");
import CommentManager = require("./comments");

// the nice thing about this is that the plugins that are returned
// originate with the MutatorFinder argument, which simplifies testing
function getMutantLocations (finder: MutatorFinder, ast: ESTree.Node): MutantLocation[] {
  const mutantLocations: MutantLocation[] = [];
  const manager = new CommentManager();

  estraverse.traverse(ast, {
    enter: function (node: ESTree.Node) {
      const locs: MutantLocation[] = applyVisitor(node, this, manager, finder);
      mutantLocations.push(...locs);
    },
  });
  return mutantLocations;
}

// No typings for estraverse.Controller :/
function applyVisitor (node: ESTree.Node, controller: any, manager: CommentManager, finder: MutatorFinder): MutantLocation[] {
  const path : string[] = controller.path();
  
  // TODO -- `shouldSkip` is the last part here which is in local module state rather than coming from an
  // argument
  if (shouldSkip(node, path)) {
    controller.skip();
    return [];
  }

  manager.applyNode(node);

  return finder(node)
    .filter(plugin => !manager.hasName(plugin.name))
    .filter(m => m.filter == null || m.filter(node))
    .map(plugin => ({node, path, mutator: plugin}))
}

export = R.curry(getMutantLocations);
