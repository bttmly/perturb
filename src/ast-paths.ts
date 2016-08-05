import fs = require("fs-extra");
import R = require("ramda");
import updateIn = require("./util/update-in");

import estraverse = require("estraverse");
import CommentManager = require("./comments");

// TODO this should be injected somehow
import shouldSkip = require("./skippers");

// the nice thing about this is that the plugins that are returned
// originate with the MutatorFinder argument, which simplifies testing
function getMutantLocations (locator: MutatorFinder, ast: ESTree.Node): MutantLocation[] {
  const mutantLocations: MutantLocation[] = [];
  const manager = new CommentManager();

  estraverse.traverse(ast, {
    enter: function (node: ESTree.Node) {
      const locs: MutantLocation[] = applyVisitor(node, this, manager, locator);
      mutantLocations.push(...locs);
    },
  });
  return mutantLocations;
}

// No typings for estraverse.Controller :/
function applyVisitor (node: ESTree.Node, controller: any, manager: CommentManager, locator: MutatorFinder): MutantLocation[] {
  const path : string[] = controller.path();
  
  // TODO -- `shouldSkip` is the last part here which is in local module state rather than coming from an
  // argument
  if (shouldSkip(node, path)) {
    controller.skip();
    return [];
  }

  manager.applyNode(node);

  return locator(node)
    .filter(plugin => !manager.hasName(plugin.name))
    .filter(m => m.filter == null || m.filter(node))
    .map(plugin => ({node, path, mutator: plugin}))
}

export = R.curry(getMutantLocations);
