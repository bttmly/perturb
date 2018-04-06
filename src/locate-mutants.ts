const estraverse = require("estraverse");

import * as R from "ramda";
import * as ESTree from "estree";
import CommentManager from "./comments";
import { MutatorPlugin, MutantLocation } from "./types";

type PluginService = (n: ESTree.Node) => MutatorPlugin[];

function locateMutants(
  mutatorsForNode: PluginService,
  ast: ESTree.Node,
): MutantLocation[] {
  const mutantLocations: MutantLocation[] = [];
  const manager = new CommentManager();
  const ctl = new estraverse.Controller();

  ctl.traverse(ast, {
    enter(node: ESTree.Node) {
      manager.applyLeading(node);
      const path: string[] = ctl.path();
      const locations = mutatorsForNode(node)
        .filter(plugin => {
          return manager.isEnabled(plugin.name);
        })
        .filter(plugin => plugin.filter == null || plugin.filter(node))
        .map(plugin => ({ node, path, mutator: plugin }));

      mutantLocations.push(...locations);
    },
    leave(node: ESTree.Node) {
      manager.applyTrailing(node);
    },
  });
  return mutantLocations;
}

export default R.curry(locateMutants);
